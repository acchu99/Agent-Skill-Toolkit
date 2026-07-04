# Supabase Security Skill

## Description
Deterministic knowledge on securing MyApp's Supabase instance using Row Level Security (RLS) and standardized policy patterns.

## Instructions
When auditing or modifying the database:
1.  **RLS Required**: Every table in the `public` schema MUST have `ENABLE ROW LEVEL SECURITY`.
2.  **Explicit Policies**: Every table MUST have at least one defined policy.
3.  **Ownership Check**: Standard access should follow the owner pattern: `(auth.uid() = user_id)`.
4.  **Tables**: Ensure table with permissions (like `space_effective_privs`) are only accessible to the `service_role` or specific security-defined roles.
5.  **Sensitive Data**: Tables containing PII or critical configuration should have restrictive `FOR SELECT` policies.

## Production Bootstrapping
When initializing a production database, follow the `example.com/supabase/production` workflow:
1.  **Seed core lookup data**: `api_types`, `privileges`.
2.  **Initialize MyApp Organization**: Create a space record with `is_organization = true`.
3.  **Bootstrap Superadmins**:
    - Add user UUIDs to `public.users` with `is_super_admin = true`.
    - Map them to the MyApp Organization space in `user_space_privs` with privilege `5` (Owner).
    - Ensure `auth.users` records exist before mapping.

## Recursive Privilege Resolution
MyApp uses recursive CTEs in views (e.g., `space_effective_privs`) for privilege resolution.
- **Verification**: Always run `03_verify_setup.sql` after deployment to ensure the permissions engine is correctly resolving privileges for the new environment.
- **Dependency**: If the permissions engine logic changes, the verification suite MUST be updated.

## Space-Scoped Feature Tables

For feature tables tied to a workspace or airline space:

- Include `space_id` and index it for list queries.
- Enforce access through existing space privilege helpers in API routes and through RLS policies in migrations.
- Keep queue tables service-role oriented when workers need to claim/lock rows, but still tie queue rows back to space-scoped parent records.
- Store `run_as_user_id` on queued work so background processors can execute with the same permission boundary as the initiating/effective user.
- Direct object URL loads must verify the object's `space_id` against the active user's access; object ID alone is not sufficient.

## Tenant Isolation & S3 Security Invariants

1.  **Deduplication Isolation**: Any file deduplication check (e.g., checking MD5 hashes of uploaded files in `myapp-v2` upload APIs) MUST be strictly scoped to the user's current Space or Organization boundary. NEVER perform global cross-tenant deduplication based solely on file hashes, as it is vulnerable to hash-spoofing side-channel attacks where an attacker guesses a hash to gain access to another tenant's file.
2.  **Safe RPC Serialization**: RPyC/RPC connections from untrusted user notebook environments to internal service components (like the datasets RPC server on port 18861) MUST NOT use executable serialization formats (like Python `pickle`). Use safe, structure-only formats (like JSON, Protocol Buffers, or MessagePack) to transmit credentials and metadata to prevent arbitrary code execution on service hosts.
3.  **Environment Separation**: Production database and S3 resources must use fully distinct buckets and connection parameters from development and staging. Verify that IAM service accounts (IRSA) have access restricted exclusively to the target environment resources.
