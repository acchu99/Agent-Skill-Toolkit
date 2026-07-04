---
description: Generate E2E test proposals for new routes and features
---

1. Execute the E2E Test Architect agent logic:
// turbo
run_command("python3 agents/scripts/e2e_architect.py")

2. Review the test coverage proposals:
view_file(AbsolutePath="<project-root>/agents/reports/e2e/latest.md")
