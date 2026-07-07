# Zustand State Patterns Skill

## Description
Best practices for managing application state in the application using Zustand and the slice pattern.

## Instructions
When modifying or creating global state:
1.  **Slice Pattern**: Use the slice pattern to combine modular state logic (e.g., `currentSpaceSlice.ts`).
2.  **Devtools Integration**: Always wrap the store in `devtools` middleware for debugging.
3.  **Selector Usage**: Encourage the use of specific selectors when consuming state in components to minimize re-renders.
4.  **Actions vs State**: Keep actions (functions that modify state) alongside the state they manage within the slice.
5.  **Persistence**: If state needs to persist, use the `persist` middleware established in the store configuration.

## the application Workspace State Rules

- Keep feature stores scoped to the active workspace when the underlying data is workspace-scoped.
- When fetching a new workspace's list, clear `selected*Id` and selected detail if the current selection is not present in the returned list.
- Do not allow a URL query param to select an item from another workspace. Validate the ID against the current-workspace list before selecting it.
- Dispatch lightweight browser events only for cross-panel refresh needs, such as Recent Work updates after create/edit/refresh.
- Persist user-level UI preferences through the existing settings flow when the preference should survive sessions; avoid duplicating that state in feature stores.

## Core Files
- `src/store/store.ts`
- `src/store/slices/`
