---
description: Trigger an investigation of the latest Sentry errors
---

1. Execute the Sentry Triage agent logic:
// turbo
run_command("python3 agents/scripts/sentry_triage.py")

2. Review the generated analysis:
view_file(AbsolutePath="<project-root>/agents/reports/sentry/latest.md")
