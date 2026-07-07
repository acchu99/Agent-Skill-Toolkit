# Permissions Engine Skill

## Description
Deterministic knowledge of recursive Role-Based Access Control (RBAC) system powered by Supabase materialized views.

## Instructions
When working on features involving permissions, access control, or database security:
1.  **RBAC Logic**: Understand that permissions are resolved recursively in `effective_workspace_privs`.
2.  **Inheritance Path**: Workspaces can inherit from other workspaces via `workspace_inheritance_privs`. Any change here triggers a view refresh.
3.  **Subject Types**: Subjects can be `user`, `workspace`, or `user_group`.
4.  **Refresh Requirement**: After modifying privilege tables (`user_workspace_privs`, `workspace_user_group_privs`, etc.), the table `effective_workspace_privs` MUST be refreshed.
5.  **Asynchronous Recompute**: In production, recomputes are enqueued via `privs_recompute_queue` and processed by a `pg_cron` worker running `drain_privs_recompute_queue()`.
6.  **Path Resolution**: Use the `resolution_path` in the `effective_workspace_privs` table to debug *why* a user has a specific permission.

## Core Files
- `supabase/migrations/privileges_table_proc_setup.sql`
- Tables: lookup core files for details.

## Related Skills
- `permissions-debugging`: Tools and SQL for tracing and force-refreshing permissions.
