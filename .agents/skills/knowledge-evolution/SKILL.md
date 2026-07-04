---
name: knowledge-evolution
description: Guidelines for maintaining and expanding the project's agentic intelligence. Teaches how to update skills, agents, and sync documentation.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Knowledge & Skill Evolution

> **"The intelligence of the system is the sum of its documented experiences."**

---

## 📋 Core Mission
The goal of this skill is to ensure that the AI's "brain" (the `.agent/` directory) evolves alongside the codebase. Every bug fixed, feature built, or infrastructure change is a potential new skill or an update to an existing one.

---

## 🔄 The Evolution Loop

1. **DETECT**: Identify a new pattern, a complex resolution, or a structural change.
2. **LOCATE**: Find the relevant `SKILL.md` or `AGENT.md` that should own this knowledge.
3. **UPDATE**: Add the new knowledge, principle, or script reference.
4. **SYNC**: Update high-level docs (`ARCHITECTURE.md`, `AGENTS.md`) to reflect the change.
5. **PROPAGATE**: Check if this improvement applies to other repositories in the ecosystem.

---

## 🎯 What to Document

| Scenario | What to Update |
|----------|----------------|
| **New Infrastructure** | `deployment-procedures`, `ARCHITECTURE.md` |
| **Complex Bug Fix** | `systematic-debugging`, `testing-patterns` |
| **New Security Pattern** | `supabase-security`, `vulnerability-scanner` |
| **UI/UX Standard** | `frontend-design`, `ui-ux-pro-max` |
| **New Agent/Workflow** | `ARCHITECTURE.md`, `AGENTS.md`, `CONTEXT.md` |
| **Documentation Update** | `myapp-documentation-generator` (Quote Mermaid labels, verify screenshots) |

---

## 🛠️ Maintenance Procedures

### 1. Architecture Synchronization
Whenever the number of agents, skills, or workflows changes:
- Update the statistics in `.agent/ARCHITECTURE.md`.
- Update the relevant tables in `.agent/ARCHITECTURE.md`.
- Mirror the summary in the root `AGENTS.md`, `CONTEXT.md`, and `CLAUDE.md`.

### 2. Skill Refinement
- Remove deprecated patterns or non-existent script references.
- Update "Example Policy Patterns" or "Core Principles" to match the latest tech stack (e.g., Next.js 15, Tailwind v4).

### 3. Cross-Project Synchronization
If you improve a common utility (e.g., `checklist.py` or `deploy.sh`) in one repository:
- Proactively check if other projects (`myapp-datasets`, `myapp-infra`, etc.) should receive the same update.

---

## ❌ Anti-Patterns to Avoid
- ❌ **Knowledge Silos**: Fixing a problem and not documenting it in a skill.
- ❌ **Stale Docs**: Updating a skill but leaving `ARCHITECTURE.md` with old stats.
- ❌ **Generic Skills**: Copy-pasting generic AI advice instead of project-specific hard-won patterns.
- ❌ **Link Rot**: Leaving local `file:///` links in documentation intended for shared use.

---

> **Mandate**: If you are about to close a task and haven't checked if the `.agent/` directory needs an update, you are NOT finished.
