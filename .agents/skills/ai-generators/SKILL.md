---
name: ai-generators
description: Principles for AI-powered graph, report, and table generators. Use when adding or modifying automated content generators.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# AI Generators Skill

> **Philosophy:** Automated generation should feel like a specialized assistant starting a fresh conversation, not an interruption of existing work.
> **Core Principle:** Isolated context is clarity.

---

## 🏗️ Core Principles

### 1. Isolated Context (MANDATORY)
**Wrong:** Appending generated content to the current thread.
**Right:** Creating a new thread for EVERY generation request.

| Why Appending is Bad | Why New Thread is Better |
|----------------------|--------------------------|
| Pollutes current project context | Dedicated sandbox for specific output |
| History becomes a mess of random prompts | Clean, searchable project history |
| Can't easily share specific generated results | Deep linkable generated artifacts |

### 2. Full Data Context
Generators MUST include all currently active data context when starting the new thread.

- **Files:** Pass `selectedFileNames` to `createNewNotebook`.
- **Databases:** Pass `selectedDatabase` as an array.
- **Attachments:** Ensure `magicQuery` receives the correct `NewAttachments` object.

### 3. Immediate UX Response
The UI must remain responsive.

- **Fast Close:** Modal should close as soon as the thread creation is initiated.
- **Redirection:** User should be redirected to the new thread immediately while generation happens in the background.

---

## 🔧 Implementation Guide

### Required Patterns

```typescript
// 1. Get Context
const { selectedFileNames, selectedDatabase } = useFileSelectMenuStore.getState();

// 2. Create Thread
const result = await createNewNotebook(
    router,
    selectedFileNames,
    selectedDatabase ? [selectedDatabase] : [],
    `[${label}] \n*Generating...*`,
    groupUuid,
);

// 3. Close Modal Fast
if (result) {
    close();
    // 4. Trigger AI Query
    await magicQuery(hiddenInstruction, attachments, true, groupUuid);
}
```

---

## ✅ Best Practices Checklist

- [ ] **UUID Linking:** Use a shared `groupUuid` for the entire generation lifecycle.
- [ ] **Router Redirect:** Ensure the `router` is passed to `createNewNotebook` for seamless redirection.
- [ ] **Silent Instruction:** Use `skipCellCreation: true` in `magicQuery` so the technical prompt remains hidden.
- [ ] **Automatic Sync:** Ensure `useNotebookStore` is used so sidebars refresh automatically.

---

## ⛔ Patterns to Avoid

| ❌ Wrong | ✅ Right |
|----------|----------|
| Using `newUuid()` inside async loop | Generate one `groupUuid` at the start |
| `close()` after `magicQuery` finishes | `close()` right after creation success |
| Empty database context | Always fetch from `FileSelectMenuStore` |
| Emulating failures with `setTimeout` | Let the real `magicQuery` handle its state |
