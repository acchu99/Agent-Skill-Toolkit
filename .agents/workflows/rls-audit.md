---
description: Trigger an autonomous RLS security audit of the Supabase instance
---

1. Execute the RLS Security Guard agent logic:
// turbo
run_command("python3 agents/scripts/rls_guard.py")

2. Review the generated report:
view_file(AbsolutePath="<project-root>/agents/reports/rls_guard/latest.md")
