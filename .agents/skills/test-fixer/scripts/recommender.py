import os
import argparse
import sys
import fnmatch
import subprocess
from pathlib import Path
from typing import Iterable, List, Optional, Set

import anthropic


DEFAULT_IGNORE_DIRS = {".git", ".pytest_cache", "__pycache__", "node_modules", "venv", ".venv", ".agent"}


def _read_text(path: Path, max_bytes: int) -> str:
    try:
        data = path.read_bytes()
        if len(data) > max_bytes:
            data = data[:max_bytes]
        return data.decode("utf-8", errors="replace")
    except Exception as e:
        return f"<ERROR reading {path}: {e}>"


def _load_glob_patterns(path: Optional[str]) -> List[str]:
    if not path:
        return []
    p = Path(path)
    if not p.exists():
        return []
    patterns: List[str] = []
    for line in p.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        patterns.append(line)
    return patterns


def _matches_any(path: str, patterns: Iterable[str]) -> bool:
    unix = path.replace(os.sep, "/")
    for pat in patterns:
        if fnmatch.fnmatch(path, pat) or fnmatch.fnmatch(unix, pat):
            return True
    return False


def _git_changed_files() -> List[str]:
    """
    Returns files changed vs HEAD (works for uncommitted changes in workflow job).
    Useful to keep recommender consistent with the post-fix code.
    """
    try:
        out = subprocess.check_output(["git", "diff", "--name-only", "HEAD"], stderr=subprocess.STDOUT).decode("utf-8")
        return [l.strip() for l in out.splitlines() if l.strip()]
    except Exception:
        return []


class TestRecommender:
    def __init__(self, api_key: str, model: str = "claude-sonnet-4-5-20250929"):
        if not api_key:
            print("Error: ANTHROPIC_API_KEY is not set.")
            sys.exit(1)
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = model

    def _iter_py_files(
        self,
        root_dir: str,
        include_roots: List[str],
        denylist_patterns: List[str],
        changed_only: bool,
        max_files: int,
    ) -> List[Path]:
        root = Path(root_dir).resolve()

        changed_set: Optional[Set[str]] = None
        if changed_only:
            changed = _git_changed_files()
            changed_set = {c.replace(os.sep, "/") for c in changed}

        candidates: List[Path] = []
        include_prefixes = [(root / r).resolve() for r in include_roots if r.strip()]

        for base in include_prefixes or [root]:
            if not base.exists():
                continue

            for path in base.rglob("*.py"):
                if set(path.parts) & DEFAULT_IGNORE_DIRS:
                    continue

                rel = path.relative_to(root).as_posix()

                if denylist_patterns and _matches_any(rel, denylist_patterns):
                    continue

                if changed_set is not None and rel not in changed_set:
                    continue

                candidates.append(path)
                if len(candidates) >= max_files:
                    return candidates

        return candidates

    def _build_context(
        self,
        files: List[Path],
        root_dir: str,
        max_total_chars: int,
        max_bytes_per_file: int,
    ) -> str:
        root = Path(root_dir).resolve()
        parts: List[str] = []
        total = 0

        for path in files:
            rel = path.relative_to(root).as_posix()
            content = _read_text(path, max_bytes=max_bytes_per_file)
            block = f"--- FILE: {rel} ---\n{content}\n"

            if total + len(block) > max_total_chars:
                remaining = max_total_chars - total
                if remaining <= 0:
                    break
                parts.append(block[:remaining])
                total += remaining
                break

            parts.append(block)
            total += len(block)

        return "\n\n".join(parts)

    def recommend_tests(
        self,
        output_path: str,
        root_dir: str = ".",
        include_roots: Optional[List[str]] = None,
        denylist_path: Optional[str] = None,
        changed_only: bool = False,
        max_files: int = 200,
        max_total_chars: int = 120_000,
        max_bytes_per_file: int = 25_000,
    ):
        include_roots = include_roots or ["src", "tests"]
        denylist_patterns = _load_glob_patterns(denylist_path)

        print("Scanning codebase for context...")
        files = self._iter_py_files(
            root_dir=root_dir,
            include_roots=include_roots,
            denylist_patterns=denylist_patterns,
            changed_only=changed_only,
            max_files=max_files,
        )

        if not files:
            print("Warning: No files selected for context. Falling back to tests/ only.")
            files = self._iter_py_files(
                root_dir=root_dir,
                include_roots=["tests"],
                denylist_patterns=denylist_patterns,
                changed_only=False,
                max_files=max_files,
            )

        context = self._build_context(
            files=files,
            root_dir=root_dir,
            max_total_chars=max_total_chars,
            max_bytes_per_file=max_bytes_per_file,
        )

        files_list_md = "\n".join([f"- {p.relative_to(Path(root_dir).resolve()).as_posix()}" for p in files])

        prompt = f"""You are an expert QA engineer.

Goal:
- Recommend the TOP 3 most valuable NEW tests to add to the existing test suite.
- Focus on stability, edge cases, regressions, and security-relevant behavior.
- Assume we only want to ADD tests (not modify product code).
- Recommendations must be implementable in tests/ only.

Selected files used as context (truncated):
{files_list_md}

CODEBASE CONTEXT:
{context}

Output:
- A Markdown report with exactly 3 recommendations.
- For each: Suggested test name, where it should live (file path under tests/), what it validates, and why it matters.
"""

        print("Requesting recommendations from Claude...")
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )

        report = response.content[0].text
        Path(output_path).write_text(report)
        print(f"Recommendations saved to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Agentic Test Recommender")
    parser.add_argument("--output", default="test_recommendations.md", help="Output path for recommendations report")
    parser.add_argument("--root", default=".", help="Repository root directory")
    parser.add_argument("--include", default="src,tests", help="Comma-separated roots to scan (e.g. 'src,tests')")
    parser.add_argument("--denylist", default=None, help="Path to denylist file with glob patterns (one per line)")
    parser.add_argument(
        "--changed-only",
        action="store_true",
        help="Only include files changed vs HEAD in the context (best after a fix step).",
    )
    parser.add_argument("--max-files", type=int, default=200, help="Max number of files to include in context")
    parser.add_argument("--max-total-chars", type=int, default=120000, help="Max total characters in prompt context")
    parser.add_argument("--max-bytes-per-file", type=int, default=25000, help="Max bytes per file included")

    args = parser.parse_args()

    api_key = os.getenv("ANTHROPIC_API_KEY")
    recommender = TestRecommender(api_key)

    include_roots = [s.strip() for s in args.include.split(",") if s.strip()]

    recommender.recommend_tests(
        output_path=args.output,
        root_dir=args.root,
        include_roots=include_roots,
        denylist_path=args.denylist,
        changed_only=args.changed_only,
        max_files=args.max_files,
        max_total_chars=args.max_total_chars,
        max_bytes_per_file=args.max_bytes_per_file,
    )


if __name__ == "__main__":
    main()
