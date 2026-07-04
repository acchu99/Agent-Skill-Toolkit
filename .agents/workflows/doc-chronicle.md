---
description: Generate an updated overview of the system architecture
---

1. Execute the Documentation Chronicler agent logic:
// turbo
run_command("python3 agents/scripts/doc_chronicler.py")

2. Review the updated architecture report:
view_file(AbsolutePath="<project-root>/agents/reports/docs/latest.md")
