import os
import json
import argparse
import sys
import re
import subprocess
from pathlib import Path
from typing import List, Optional, Tuple

import anthropic

# Strict directory restriction for write operations
ALLOWED_WRITE_DIR = "tests"


class AgentTestFixer:
    def __init__(self, api_key: str):
        if not api_key:
            print("Error: ANTHROPIC_API_KEY is not set.")
            sys.exit(1)
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-sonnet-4-5-20250929"

        # Track last model-provided human_required
        self.last_human_required: Optional[bool] = None

    def _read_file(self, path: str) -> str:
        try:
            with open(path, "r") as f:
                return f.read()
        except Exception as e:
            return f"Error reading file {path}: {str(e)}"

    def _get_project_structure(self, root_dir: str = ".") -> str:
        """Generates a text-based tree of the project structure."""
        tree = []
        ignore_dirs = {".git", ".pytest_cache", "__pycache__", "node_modules", "venv", ".venv", ".agent"}

        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            level = root.replace(root_dir, "").count(os.sep)
            indent = "  " * level
            tree.append(f"{indent}{os.path.basename(root)}/")
            sub_indent = "  " * (level + 1)
            for f in files:
                if not f.startswith("."):
                    tree.append(f"{sub_indent}{f}")

        return "\n".join(tree)

    def _write_file(self, path: str, content: str):
        # Enforce directory restriction
        abs_path = Path(path).resolve()
        abs_allowed = Path(ALLOWED_WRITE_DIR).resolve()

        if not str(abs_path).startswith(str(abs_allowed)):
            print(
                f"Error: Write operation blocked. Attempted to write to {path}, "
                f"which is outside {ALLOWED_WRITE_DIR}."
            )
            return False

        try:
            abs_path.parent.mkdir(parents=True, exist_ok=True)
            with open(abs_path, "w") as f:
                f.write(content)
            print(f"Successfully wrote to {path}")
            return True
        except Exception as e:
            print(f"Error writing to file {path}: {str(e)}")
            return False

    def analyze_failures(self, report_path: str, output_path: str):
        print(f"Phase 1: Analyzing failures from {report_path}...")

        report_data = {}
        if os.path.exists(report_path):
            with open(report_path, "r") as f:
                report_data = json.load(f)
        else:
            print(f"Error: Report file {report_path} not found.")
            sys.exit(1)

        # Build a concise failure summary for the model
        failures = []
        tests = report_data.get("tests", [])
        for t in tests:
            if t.get("outcome") in ("failed", "error"):
                failures.append(
                    {
                        "nodeid": t.get("nodeid"),
                        "outcome": t.get("outcome"),
                        "longrepr": t.get("longrepr"),
                    }
                )

        project_tree = self._get_project_structure()

        system_msg = (
            "You are an expert Python developer and test triage engineer.\n"
            "Your job: Read the pytest JSON report and produce a precise failure analysis.\n"
            "Constraints:\n"
            f"- Tests-only: fixes will be applied ONLY inside ./{ALLOWED_WRITE_DIR}/\n"
            "- Be specific: reference test file paths + line-level root cause guesses.\n"
            "- Output MUST be a Markdown report with a short checklist of recommended changes.\n"
        )

        user_content = (
            f"PYTEST FAILURES (JSON excerpts):\n{json.dumps(failures, indent=2)[:120000]}\n\n"
            f"PROJECT STRUCTURE:\n{project_tree}\n\n"
            "Create a Markdown analysis report. Include:\n"
            "1) What failed (list)\n"
            "2) Likely root causes\n"
            "3) Exact suggested test-file edits (tests-only)\n"
            "4) Anything that looks like a product-code bug (flag only; do NOT fix)\n"
        )

        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            system=system_msg,
            messages=[{"role": "user", "content": user_content}],
        )

        report_text = response.content[0].text
        with open(output_path, "w") as f:
            f.write(report_text)

        print(f"Analysis report saved to {output_path}")

    def _get_code_context(self, report_text: str) -> str:
        """Extracts and reads relevant file contents based on report text."""
        context = ""
        # Identify files mentioned in the report (src and tests)
        paths = set(re.findall(r'src/[\w/.-]+\.py|tests/[\w/.-]+\.py', report_text))
        
        # Always include conftest.py for fixture awareness
        conftest_path = "tests/conftest.py"
        if os.path.exists(conftest_path):
            paths.add(conftest_path)

        for path in sorted(list(paths)):
            content = self._read_file(path)
            if content and not content.startswith("Error"):
                context += f"--- FILE: {path} ---\n{content}\n\n"
        return context

    def implement_fix(self, analysis_report_path: str, prev_attempt_context: Optional[str] = None):
        analysis_report = self._read_file(analysis_report_path)
        if not analysis_report:
            print("No analysis report found.")
            return

        print(f"Phase 2: Implementing fixes based on {analysis_report_path}...")

        context = self._get_code_context(analysis_report)
        project_tree = self._get_project_structure()
        
        system_msg = (
            "You are an expert Python developer. Your goal is to fix failing tests with MINIMAL changes.\n"
            f"STRICT DIRECTORY RESTRICTION: You may ONLY modify files in the `./{ALLOWED_WRITE_DIR}/` folder.\n"
            "You have read-only access to the source code. If you see a mismatch between test expectations and source code behavior, align the test with the source code.\n\n"
            "CORE PRINCIPLES:\n"
            "1) ALIGN EXPECTATIONS: If a test asserts a value or structure that the source code does not provide, update the test to reflect reality.\n"
            "2) NO INVENTED MOCKS: Do NOT create complex mocks for data structures that don't exist in the source code.\n"
            "3) RULE OF LEAST CHANGE: Smallest edit to make the test accurate relative to the actual codebase.\n\n"
            "FORMATTING RULES:\n"
            "1. Wrap each file change in <FILE path='path/to/file.py'> tags.\n"
            "2. Provide the FULL content of the file.\n"
            "3. State whether human verification is needed in <HUMAN_REQUIRED>true/false</HUMAN_REQUIRED> tags.\n"
            "4. Provide your reasoning in <REASONING> tags.\n"
        )

        user_content = (
            f"PROJECT STRUCTURE:\n{project_tree}\n\n"
            f"CODE CONTEXT (READ-ONLY):\n{context}\n\n"
            f"FAILURE ANALYSIS REPORT:\n{analysis_report}\n\n"
        )
        if prev_attempt_context:
            user_content += (
                "PREVIOUS ATTEMPT FAILURE LOG (for debugging):\n"
                f"{prev_attempt_context}\n\n"
                "Please refine the fix based on this log.\n"
            )
        else:
            user_content += "Please provide the fix for the failing tests.\n"

        response = self.client.messages.create(
            model=self.model,
            max_tokens=8192,
            system=system_msg,
            messages=[{"role": "user", "content": user_content}],
        )

        output = response.content[0].text
        self._apply_changes(output)

    def generate_tests(self, recommendation_report_path: str, prev_attempt_context: Optional[str] = None):
        recommendation_report = self._read_file(recommendation_report_path)
        if not recommendation_report:
            print("No recommendation report found.")
            return

        print(f"Phase 3: Generating new tests based on {recommendation_report_path}...")

        context = self._get_code_context(recommendation_report)
        project_tree = self._get_project_structure()
        
        system_msg = (
            "You are an expert Python developer. Your goal is to implement new tests based on recommendations.\n"
            f"STRICT DIRECTORY RESTRICTION: You may ONLY modify files in the `./{ALLOWED_WRITE_DIR}/` folder.\n"
            "CORE PRINCIPLES:\n"
            "1) ADD TESTS ONLY: Prefer creating new test files or adding new test functions.\n"
            "2) NO PRODUCT CODE CHANGES: Do not modify src/ or application code.\n"
            "3) KEEP TESTS MEANINGFUL: Avoid trivial asserts that don't validate behavior.\n"
            "4) FIXTURE AWARENESS: Check `tests/conftest.py` for existing setup. Do NOT redefine existing fixtures. Use them directly.\n"
            "5) SAFETY: Never overwrite `tests/conftest.py` unless the recommendation explicitly requires a new global setup.\n\n"
            "OUTPUT FORMAT (MANDATORY):\n"
            "- One or more <FILE path='...'>...</FILE> blocks\n"
            "- <REASONING>...</REASONING>\n"
            "- <HUMAN_REQUIRED>true|false</HUMAN_REQUIRED>\n"
        )

        user_content = (
            f"PROJECT STRUCTURE:\n{project_tree}\n\n"
            f"EXISTING CODE CONTEXT (READ-ONLY):\n{context}\n\n"
            f"TEST RECOMMENDATION REPORT:\n{recommendation_report}\n\n"
        )
        
        if prev_attempt_context:
            user_content += (
                "PREVIOUS GENERATION FAILURE (for correction):\n"
                f"{prev_attempt_context}\n\n"
                "Your previous generation attempt failed to run. Please fix the newly generated tests based on the error above.\n"
            )
        else:
            user_content += "Please implement the recommended tests using available fixtures.\n"

        response = self.client.messages.create(
            model=self.model,
            max_tokens=8192,
            system=system_msg,
            messages=[{"role": "user", "content": user_content}],
        )

        output = response.content[0].text
        self._apply_changes(output)

    def _apply_changes(self, output: str):
        # Parse response robustly using tags
        try:
            file_blocks = re.findall(r"<FILE path=['\"](.*?)['\"]>(.*?)</FILE>", output, re.DOTALL)
            human_required_match = re.search(
                r"<HUMAN_REQUIRED>(true|false)</HUMAN_REQUIRED>", output, re.IGNORECASE
            )

            if not file_blocks:
                print("No <FILE> tags found in model response.")
                print("--- RAW OUTPUT START ---")
                print(output)
                print("--- RAW OUTPUT END ---")
                sys.exit(1)

            for path, content in file_blocks:
                self._write_file(path.strip(), content.strip())

            human_required = bool(human_required_match and human_required_match.group(1).lower() == "true")
            self.last_human_required = human_required

            # Output to GitHub Actions if available (useful for downstream steps if desired)
            if "GITHUB_OUTPUT" in os.environ:
                with open(os.environ["GITHUB_OUTPUT"], "a") as f:
                    f.write(f"human_required={str(human_required).lower()}\n")

        except Exception as e:
            print(f"Error parsing model response: {str(e)}")
            sys.exit(1)

    # ----------------------------
    # Safety / quality guardrails
    # ----------------------------
    def _assess_diff_safety(self, diff: str) -> Tuple[bool, List[str]]:
        """
        Simple heuristic guardrails:
        - If we remove asserts or tests, mark human_required = true
        - If we add broad exception swallowing, mark human_required = true
        - If we add skip/xfail, mark human_required = true
        """
        reasons: List[str] = []
        removed_asserts = 0
        added_asserts = 0
        removed_test_defs = 0
        added_skips = 0
        added_broad_except = 0

        for line in diff.splitlines():
            if line.startswith("---") or line.startswith("+++") or line.startswith("@@"):
                continue

            if line.startswith("-"):
                if re.search(r"\bassert\b", line):
                    removed_asserts += 1
                if re.search(r"def\s+test_", line):
                    removed_test_defs += 1

            if line.startswith("+"):
                if re.search(r"\bassert\b", line):
                    added_asserts += 1
                if re.search(r"\bpytest\.mark\.(skip|xfail)\b", line) or re.search(r"\bskip\(", line):
                    added_skips += 1
                if re.search(r"except\s+Exception\s*:", line) or re.search(r"except\s*:", line):
                    added_broad_except += 1

        # Heuristic triggers
        if removed_asserts > added_asserts:
            reasons.append(
                f"Removed more assertions than added (removed={removed_asserts}, added={added_asserts}). "
                "This can weaken test coverage."
            )
        if removed_test_defs > 0:
            reasons.append(f"Removed {removed_test_defs} test definitions (def test_*).")
        if added_skips > 0:
            reasons.append("Added skip/xfail markers, which can hide failures instead of validating behavior.")
        if added_broad_except > 0:
            reasons.append("Added broad exception handling (except/except Exception), which can hide real errors.")

        human_required = len(reasons) > 0
        return human_required, reasons

    def summarize_changes(self, output_path: str, compare_ref: Optional[str] = None):
        """Generates a summary of the changes for a PR body, including a safety review section."""
        try:
            if compare_ref:
                # Use triple-dot diff to see changes since the branch diverged from HEAD
                diff = subprocess.check_output(["git", "diff", f"HEAD...{compare_ref}"]).decode("utf-8")
            else:
                diff = subprocess.check_output(["git", "diff", "HEAD"]).decode("utf-8")
        except Exception:
            diff = ""

        # Safety assessment based on diff
        diff_human_required, diff_reasons = self._assess_diff_safety(diff or "")

        # Combine with model-provided flag if present
        combined_human_required = bool(diff_human_required or (self.last_human_required is True))

        safety_block = ["## Safety Review", f"- human_required: **{str(combined_human_required).lower()}**"]
        if diff_reasons:
            safety_block.append("- reasons:")
            for r in diff_reasons:
                safety_block.append(f"  - {r}")
        else:
            safety_block.append("- reasons: (no heuristic red flags detected)")

        safety_md = "\n".join(safety_block)

        if not diff:
            summary = "No changes were detected in the git diff."
            final = f"{safety_md}\n\n## Summary\n{summary}\n"
        else:
            prompt = (
                "Summarize the following code changes for a PR description.\n"
                "Focus on what was fixed/added and why.\n"
                "Be brief and clear.\n\n"
                f"{diff}"
            )
            response = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
            )
            summary = response.content[0].text
            final = f"{safety_md}\n\n## Summary\n{summary}\n"

        with open(output_path, "w") as f:
            f.write(final)
        print(f"Summary saved to {output_path}")

        # Also export as action output if needed
        if "GITHUB_OUTPUT" in os.environ:
            with open(os.environ["GITHUB_OUTPUT"], "a") as f:
                f.write(f"human_required={str(combined_human_required).lower()}\n")


def main():
    parser = argparse.ArgumentParser(description="Agentic Test Fixer")
    parser.add_argument("--mode", choices=["analyze", "fix", "generate_tests", "summary"], required=True)
    parser.add_argument("--report", help="Path to report file")
    parser.add_argument("--output", help="Output path")
    parser.add_argument("--context", help="Previous attempt context file")
    parser.add_argument("--compare", help="Ref to compare against in summary mode")

    args = parser.parse_args()

    api_key = os.getenv("ANTHROPIC_API_KEY")
    fixer = AgentTestFixer(api_key)

    if args.mode == "analyze":
        fixer.analyze_failures(args.report, args.output or "failure_analysis.md")
    elif args.mode == "fix":
        prev_context = None
        if args.context and os.path.exists(args.context):
            with open(args.context, "r") as f:
                prev_context = f.read()
        fixer.implement_fix(args.report, prev_context)
    elif args.mode == "generate_tests":
        prev_context = None
        if args.context and os.path.exists(args.context):
            with open(args.context, "r") as f:
                prev_context = f.read()
        fixer.generate_tests(args.report, prev_context)
    elif args.mode == "summary":
        fixer.summarize_changes(args.output or "pr_summary.md", args.compare)


if __name__ == "__main__":
    main()
