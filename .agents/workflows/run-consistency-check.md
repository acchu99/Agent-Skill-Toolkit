---
description: Steps to run a full consistency check across docs and diagrams
---

# Run Consistency Check

Follow these steps to audit the project for stale references, broken links, and concept drift.

// turbo-all

## Steps

### 1. Scan for banned terms

```bash
cd <project-root> && echo "=== Banned Terms ===" && grep -ric "clickup\|metabase" docs/ | grep -v ":0$" || echo "✅ No banned terms found"
```

### 2. Check diagram registry completeness

```bash
cd <project-root> && echo "=== Orphan .mmd files (not in registry) ===" && for f in docs/diagrams/*.mmd; do basename="${f##*/}"; grep -q "$basename" docs/diagrams/registry.json || echo "⚠️  $basename not in registry.json"; done && echo "Done"
```

### 3. Validate inline diagram markers

```bash
cd <project-root> && echo "=== Inline diagram markers ===" && grep -rn "DIAGRAM:.*START" docs/overview/ | while read -r line; do id=$(echo "$line" | grep -oP 'DIAGRAM: \K[^ ]+'); file="docs/diagrams/${id}.mmd"; [ ! -f "$file" ] && echo "⚠️  $line → missing $file"; done && echo "Done"
```

### 4. Check for broken internal links

```bash
cd <project-root> && echo "=== Broken internal links ===" && grep -rhoP '\[.*?\]\((?!http)[^)]+\)' docs/overview/ | grep -oP '\((?!http)\K[^)]+' | while read -r link; do [ ! -f "docs/overview/$link" ] && [ ! -f "$link" ] && echo "⚠️  Missing: $link"; done | head -20 && echo "Done"
```

### 5. Validate YAML configs

```bash
cd <project-root> && echo "=== YAML validation ===" && python3 -c "
import yaml, glob, sys
errors = []
for f in glob.glob('brands/**/*.yaml', recursive=True) + glob.glob('templates/*.yaml'):
    try:
        yaml.safe_load(open(f))
    except Exception as e:
        errors.append(f'{f}: {e}')
print(f'Checked {len(glob.glob(\"brands/**/*.yaml\", recursive=True) + glob.glob(\"templates/*.yaml\"))} files')
for e in errors: print(f'⚠️  {e}')
if not errors: print('✅ All YAML valid')
"
```

### 6. Validate JSON schemas

```bash
cd <project-root> && echo "=== JSON schema validation ===" && python3 -c "
import json, glob
errors = []
for f in glob.glob('prompts/schemas/*.json') + glob.glob('docs/diagrams/registry.json'):
    try:
        json.load(open(f))
    except Exception as e:
        errors.append(f'{f}: {e}')
print(f'Checked {len(glob.glob(\"prompts/schemas/*.json\"))+1} files')
for e in errors: print(f'⚠️  {e}')
if not errors: print('✅ All JSON valid')
"
```

### 7. Review findings and fix

- For banned terms: replace with current terminology (see `CONTEXT.md` → Banned Terms)
- For orphan diagrams: add to `registry.json` or confirm intentional
- For broken links: fix the link path
- For YAML/JSON errors: fix syntax
- Follow `update-architecture` workflow if diagram changes are needed
