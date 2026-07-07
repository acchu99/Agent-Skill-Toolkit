---
name: release-engineering
description: Git and release hygiene — atomic commits, Conventional Commits, high-signal PR descriptions, Keep a Changelog, Semantic Versioning, tag/release notes, and branch strategy. Use when writing commits or PRs, cutting a release, or setting up versioning/changelog conventions.
when_to_use: "When writing a commit message or PR description, cutting a release/tag, generating a changelog, choosing a version bump, or defining branch/release conventions. Load writing-humanizer for the prose and code-review-checklist before merging."
allowed-tools: Read, Write, Edit, Bash
---

# Release Engineering

> Commits and changelogs are documentation your future self and teammates read under pressure. Optimize them for the person doing a `git blame` at 2am.

## When to Apply

Writing commit messages and PR descriptions, cutting a version/tag, producing a changelog or release notes, or establishing versioning and branching conventions for a repo.

## Atomic Commits

- **One logical change per commit.** A commit should be revertable on its own without breaking unrelated things.
- Don't mix refactor + behavior change + formatting in one commit — reviewers can't tell what's intentional.
- Commit early and often locally; clean up with rebase before sharing if the repo's flow allows it.
- Never commit secrets, generated artifacts, or commented-out code.

## Conventional Commits

Format: `type(scope): summary`

```text
feat(auth): add password-reset via magic link
fix(api): return 404 instead of 500 for missing user
refactor(db): extract query builder; no behavior change
docs(readme): document env vars
```

| Type | Use for | Version impact* |
|------|---------|-----------------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `refactor` | Code change, no behavior change | — |
| `perf` | Performance improvement | PATCH |
| `docs` | Documentation only | — |
| `test` | Tests only | — |
| `build` / `ci` | Build system, pipelines | — |
| `chore` | Tooling, deps, housekeeping | — |

*When commit conventions drive automated versioning. A `BREAKING CHANGE:` footer (or `type!:`) triggers a MAJOR bump.

**Summary line rules:** imperative mood ("add", not "added"/"adds"), ≤ ~50 chars, no trailing period, lowercase after the colon. Put the *why* in the body, wrapped at ~72 chars.

## PR Descriptions (high-signal)

A reviewer should understand the change without reading the diff first.

```markdown
## What
One-paragraph summary of the change and the user-visible effect.

## Why
The problem/motivation. Link the issue.

## How
Key implementation decisions and any trade-offs. Call out anything surprising.

## Testing
How you verified it (commands, scenarios). Screenshots for UI.

## Risk / rollback
Blast radius, migrations, feature flags, how to revert.
```

Keep PRs **small and single-purpose** — they review faster and revert cleaner. Run `code-review-checklist` before requesting review. Write the prose with `writing-humanizer` (no "This PR seamlessly leverages…").

## Semantic Versioning (SemVer)

`MAJOR.MINOR.PATCH` — e.g. `2.4.1`

| Bump | When | Example |
|------|------|---------|
| **MAJOR** | Breaking API/behavior change | `2.x → 3.0.0` |
| **MINOR** | Backward-compatible feature | `2.4 → 2.5.0` |
| **PATCH** | Backward-compatible bug fix | `2.4.1 → 2.4.2` |

- Pre-release: `1.0.0-beta.1`; build metadata: `1.0.0+build.5`.
- `0.y.z` means "anything may change" — the public API isn't stable until `1.0.0`.
- The public contract determines the bump — a "small" change that breaks a documented API is still MAJOR.

## Changelog (Keep a Changelog)

Maintain a human-written `CHANGELOG.md`, newest first, grouped by type:

```markdown
## [Unreleased]

## [2.5.0] - 2026-07-07
### Added
- Password reset via magic link.
### Fixed
- Missing-user endpoint now returns 404, not 500.
### Changed
- Default session length reduced to 24h.
### Deprecated / Removed / Security
- ...
```

- Write for **users of the project**, not from git log dumps. Explain impact, not internal file churn.
- Keep an `[Unreleased]` section you add to as you go; cut it into a version on release.
- Link versions to compare URLs / tags at the bottom.

## Release Notes & Tagging

1. Ensure the changelog `[Unreleased]` is complete and the version bump is correct.
2. Tag with the version: `git tag -a v2.5.0 -m "v2.5.0"` and push tags.
3. Release notes = the changelog section + upgrade instructions + any migration/breaking notes up top.
4. Lead release notes with what the **reader must do** (breaking changes, migrations) before the nice-to-know list.

## Branch Strategy (pick one, keep it simple)

| Strategy | Shape | Best for |
|----------|-------|----------|
| **Trunk-based** | Short-lived branches → `main`, flags for incomplete work | CI/CD, fast-moving teams |
| **GitHub Flow** | Branch → PR → merge → deploy | Most web apps |
| **Git Flow** | `develop` + `release` + `hotfix` branches | Versioned/released software with support windows |

Default to trunk-based or GitHub Flow unless you ship versioned releases to third parties.

## Anti-Patterns

❌ **"fix", "wip", "update", "stuff"** — commit messages with no information.
❌ **Mega-commits** — 40 files, five unrelated changes, one message.
❌ **Changelog = git log** — dumping raw commits instead of user-facing notes.
❌ **Version bumped by vibes** — breaking change shipped as a PATCH.
❌ **PR with no "why"** — reviewer has to reverse-engineer intent.

## Quick Checklist

- [ ] Each commit is one logical, revertable change
- [ ] Commit summary: imperative, ≤ 50 chars, typed/scoped
- [ ] PR states what / why / how / testing / risk
- [ ] Version bump matches SemVer rules for the change
- [ ] Changelog updated in user-facing language
- [ ] Release notes lead with breaking changes/migrations

## Related Skills

- `writing-humanizer` — commit/PR/changelog prose that reads like a human.
- `code-review-checklist` — pre-merge review gate.
- `clean-code` — the code the commits describe.
- `deployment-procedures` — shipping the tagged release.
