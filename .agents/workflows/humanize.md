---
description: Strip AI writing tells from a document so it reads like a person wrote it. Loads the writing-humanizer skill.
---

# /humanize - De-slop Prose

$ARGUMENTS

---

## Task

Edit the target text (a file path, a pasted passage, or the most recent draft) to remove AI writing tells while preserving every fact, number, and caveat.

### Steps

1. **Load the skill**
   - Read `.agents/skills/writing-humanizer/SKILL.md` and announce it: `📚 Using skill: @writing-humanizer`.

2. **Identify the target**
   - If `$ARGUMENTS` is a file path → read it.
   - If it's pasted text → operate on that.
   - If empty → humanize the most recent draft you produced this session.

3. **Run the humanize pass** (from the skill)
   - Delete throat-clearing openers; lead with the actual point.
   - Remove banned vocabulary (leverage, robust, seamless, delve, elevate, unlock, game-changing, "in today's…").
   - Cap em-dashes at ~1 per paragraph; break uniform rhythm.
   - Kill "it's not just X, it's Y" constructions and hollow conclusions.
   - **Preserve every fact, number, name, and caveat.**

4. **Apply**
   - For a file: edit in place.
   - For pasted text: return the rewritten version.

5. **Report**
   - Briefly note what categories of tells were removed (e.g. "cut opener + 6 hype words, split 3 long sentences"). Do not pad the report.

---

## Usage Examples

```
/humanize README.md
/humanize docs/getting-started.md
/humanize   (cleans up the last thing you drafted)
```

---

## Guardrails

- This edits tone, not truth. Never invent experience, testimonials, or claims to sound human.
- Keep genuine hedges ("usually", "in most cases") — they're honest.
- For marketing copy, pair with the `copywriting` skill; for commits/PRs, with `release-engineering`.
