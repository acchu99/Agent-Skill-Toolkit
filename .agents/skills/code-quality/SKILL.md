# the application Code Quality Skill

## Description
Standards for maintaining a clean, type-safe, and high-quality codebase in the application project.

## Instructions
When implementing or reviewing code:
1.  **Type Safety (P0)**: Avoid `any` at all costs. Use Zod schemas or strict TypeScript interfaces for API responses and component props.
2.  **Suppression Management**: `@ts-ignore` is a debt marker. If used, it must be accompanied by a specific explanation and a plan to remove it.
3.  **Component Composition**: Favor small, focused React components over monolithic files.
4.  **State Management**: Follow the patterns established in `src/store/`. Do not introduce ad-hoc state managers.
5.  **Documentation**: Public utilities and complex logic in `src/utils/` must have TSDoc comments.

## Debt Smell Patterns
- Searching for `:\s*any`
- Searching for `@ts-ignore`
- Searching for `// TODO` or `// FIXME`
