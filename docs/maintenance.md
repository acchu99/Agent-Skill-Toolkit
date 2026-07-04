# Maintenance

This guide covers how to keep the consolidated agent kit accurate, useful, and safe to copy into other projects.

## Inventory Checks

Before publishing documentation or a release, recount the main assets:

```bash
find .agents/agent -maxdepth 1 -type f -name '*.md' | wc -l
find .agents/skills -mindepth 1 -maxdepth 2 -name 'SKILL.md' | wc -l
find .agents/skills -maxdepth 1 -type f -name '*.md' | wc -l
find .agents/workflows -maxdepth 1 -type f -name '*.md' | wc -l
find .agents/rules -maxdepth 1 -type f -name '*.md' | wc -l
find .agents/scripts -maxdepth 1 -type f | wc -l
```

Update `README.md` and `.agents/ARCHITECTURE.md` when these numbers change.

## Stale Wording Checks

Search for old inventory language:

```bash
rg "20[ ]Specialist Agents|47[ ]Skills|13[ ]Workflows|45\\+[ ]skills|20\\+[ ]specialist" .
```

Search for broken or outdated project names:

```bash
rg "AG Kit|Consolidated Agent Skills|\\.agents" README.md docs .agents/ARCHITECTURE.md
```

## Link Checks

For Markdown links, verify that local relative links point to existing files. A lightweight manual pass is usually enough for this repository because the docs set is small.

Important links to check:

- `README.md` to every `docs/*.md` file.
- `docs/*.md` references to `.agents/` files.
- `.agents/ARCHITECTURE.md` references to scripts and docs.
- External links to upstream AG Kit documentation.

## Validation Scripts

The helper scripts in `.agents/scripts/` are intended to support projects that adopt the kit. They may need project-specific dependencies or command adaptation.

Current helper scripts:

- `auto_preview.py`
- `checklist.py`
- `session_manager.py`
- `verify_all.py`

Do not claim these scripts verify a target project unless you have run them in that project and confirmed they match its stack.

## Updating From Upstream AG Kit

When incorporating upstream AG Kit changes:

1. Review upstream concept changes in Agents, Skills, and Workflows.
2. Compare upstream files against this repository's extensions.
3. Preserve local additions intentionally.
4. Reconcile renamed workflows or skills.
5. Update attribution and compatibility notes.
6. Re-run inventory and stale wording checks.

Avoid blind overwrites. This repository is an extension, so local changes may be deliberate.

## Release Hygiene

Before tagging or distributing a version:

1. Confirm the root README describes the current repository accurately.
2. Confirm docs explain how to copy the kit into another project.
3. Confirm no workflow promises unsupported automation.
4. Confirm memory examples do not include private project secrets.
5. Confirm scripts are documented as optional helpers.
6. Confirm attribution to AG Kit is present.

## Documentation-Only Changes

For documentation-only updates:

- Do not edit agent behavior.
- Do not change workflow steps.
- Do not alter scripts.
- Do not update memory unless explicitly requested.
- Keep verification focused on links, counts, and wording consistency.
