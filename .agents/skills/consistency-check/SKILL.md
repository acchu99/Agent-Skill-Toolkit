---
name: consistency-check
description: Run a full consistency check across docs and diagrams — scan for banned terms, orphan diagrams, broken links, and validate YAML/JSON configs. Use when auditing the project for stale references or concept drift.
disable-model-invocation: true
---

# Run Consistency Check

Follow these steps to audit the project for stale references, broken links, and concept drift.

## Steps

### 1. Scan for banned terms

```bash
echo "=== Banned Terms ===" && grep -ric "clickup\|metabase" docs/ | grep -v ":0$" || echo "No banned terms found"
```

### 2. Check diagram registry completeness

```bash
echo "=== Orphan .mmd files (not in registry) ===" && for f in docs/diagrams/*.mmd; do basename="${f##*/}"; grep -q "$basename" docs/diagrams/registry.json || echo "WARNING: $basename not in registry.json"; done && echo "Done"
```

### 3. Validate inline diagram markers

```bash
echo "=== Inline diagram markers ===" && grep -rn "DIAGRAM:.*START" docs/overview/ | while read -r line; do id=$(echo "$line" | grep -oP 'DIAGRAM: \K[^ ]+'); file="docs/diagrams/${id}.mmd"; [ ! -f "$file" ] && echo "WARNING: $line -> missing $file"; done && echo "Done"
```

### 4. Check for broken internal links

```bash
echo "=== Broken internal links ===" && grep -rhoP '\[.*?\]\((?!http)[^)]+\)' docs/overview/ | grep -oP '\((?!http)\K[^)]+' | while read -r link; do [ ! -f "docs/overview/$link" ] && [ ! -f "$link" ] && echo "WARNING: Missing: $link"; done | head -20 && echo "Done"
```

### 5. Validate YAML configs

```bash
echo "=== YAML validation ===" && python3 -c "
import yaml, glob, sys
errors = []
for f in glob.glob('brands/**/*.yaml', recursive=True) + glob.glob('templates/*.yaml'):
    try:
        yaml.safe_load(open(f))
    except Exception as e:
        errors.append(f'{f}: {e}')
print(f'Checked {len(glob.glob(\"brands/**/*.yaml\", recursive=True) + glob.glob(\"templates/*.yaml\"))} files')
for e in errors: print(f'WARNING: {e}')
if not errors: print('All YAML valid')
"
```

### 6. Validate JSON schemas

```bash
echo "=== JSON schema validation ===" && python3 -c "
import json, glob
errors = []
for f in glob.glob('prompts/schemas/*.json') + glob.glob('docs/diagrams/registry.json'):
    try:
        json.load(open(f))
    except Exception as e:
        errors.append(f'{f}: {e}')
print(f'Checked {len(glob.glob(\"prompts/schemas/*.json\"))+1} files')
for e in errors: print(f'WARNING: {e}')
if not errors: print('All JSON valid')
"
```

### 7. Review findings and fix

- For banned terms: replace with current terminology (see `CLAUDE.md` → Banned Terms)
- For orphan diagrams: add to `registry.json` or confirm intentional
- For broken links: fix the link path
- For YAML/JSON errors: fix syntax
- Follow `/update-architecture` skill if diagram changes are needed
