# AI Query Prompting Skill

## Description
Best practices and prompt engineering guidelines for a generic AI-driven data analysis feature (AI Query).

## Instructions
When refining AI prompt templates or analyzing failures:
1.  **Identity Context**: Always ensure the AI knows it is a data scientist assistant within the application.
2.  **Deterministic Headers**: Favor structured system instructions over long prose.
3.  **Constraint Enforcement**: Explicitly forbid the AI from hallucinating columns or tables not provided in the metadata.
4.  **Few-Shot Priority**: When SQL or Python generation fails, prioritize adding a new few-shot example that covers the specific edge case.
5.  **Ambiguity Handling**: If a user request is ambiguous, the prompt should instruct the AI to ask for clarification or use the most statistically likely intent.

## Core Templates location
`src/utils/ai-query/`
- `queryPrompt.ts`
- `messages.ts`
- `edit.ts`
