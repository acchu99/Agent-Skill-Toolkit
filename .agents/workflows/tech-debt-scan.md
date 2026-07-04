---
description: Trigger a comprehensive scan for code smells and technical debt
---

1. Execute the Tech Debt Janitor agent logic:
// turbo
run_command("python3 agents/scripts/tech_debt.py")

2. Review the generated report:
view_file(AbsolutePath="<project-root>/agents/reports/tech_debt/latest.md")
