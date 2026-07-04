# Test Fixer Skill

This skill provides agentic capabilities to automatically analyze and fix failing pytest tests using Anthropic Claude (Sonnet 3.5).

## Components

- `scripts/fixer.py`: The core logic script.

## Usage

### Phase 1: Analysis

Generates a `failure_analysis.md` report from `pytest-report.json`.

```bash
python .agent/skills/test-fixer/scripts/fixer.py --mode analyze --report pytest-report.json --output failure_analysis.md
```

### Phase 2: Implementation

Consumes `failure_analysis.md` and applies fixes to files in `./tests`.

```bash
python .agent/skills/test-fixer/scripts/fixer.py --mode fix --report failure_analysis.md
```

## Restrictions

- **Write Permission**: Only `./tests` directory.
- **Read Permission**: Entire codebase.
