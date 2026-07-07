#!/usr/bin/env node
/**
 * generate_db_docs.js
 * 
 * Parses src/types/database.types.ts to extract all Supabase tables, views,
 * and functions, assigns them to logical domain groups, and generates an
 * exhaustive 04-database-architecture.md documentation file.
 * 
 * Usage:
 *   node .agents/skills/documentation-generator/scripts/generate_db_docs.js
 * 
 * Run this whenever a new Supabase migration is added.
 */

const fs = require("fs");
const path = require("path");

// ──────────────────────────────────────────────────────────────────────────────
// Paths
// ──────────────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "../../../../");
const DB_TYPES_FILE = path.join(ROOT, "src/types/database.types.ts");
const OUTPUT_FILE = path.join(ROOT, "documentation/04-database-architecture.md");
const MIGRATIONS_DIR = path.join(ROOT, "supabase/migrations");

// ──────────────────────────────────────────────────────────────────────────────
// Domain group classification map
// Tables/views/functions → group name (order matters: first match wins)
// ──────────────────────────────────────────────────────────────────────────────
const DOMAIN_GROUPS = [
  {
    id: "g1",
    name: "Identity & Auth",
    description:
      "Core user identity tables that mirror `auth.users` and enforce access blocklists.",
    match: (name) =>
      ["users", "blocked_domains", "blocked_emails", "school_domains"].includes(name) ||
      name.startsWith("handle_new_user"),
  },
  {
    id: "g2",
    name: "Organizations & Workspaces",
    description:
      "Organizational hierarchy — Workspaces are the primary security boundary. Workspaces can inherit privileges from parent workspaces.",
    match: (name) =>
      ["workspaces", "workspace_inheritance_privs", "user_groups", "user_group_members",
       "workspace_user_group_privs", "user_workspace_privs", "settings", "system_settings"].includes(name),
  },
  {
    id: "g3",
    name: "Threads & Notebooks",
    description:
      "The conversational AI interface. Each Thread is backed by a Jupyter Notebook file in Supabase Storage.",
    match: (name) =>
      ["threads", "storage", "storage_thread_mapping", "workspace_threads_privs",
       "thread_memory"].includes(name) ||
      name.includes("thread") ||
      name === "sync_thread_from_storage",
  },
  {
    id: "g4",
    name: "Datasets & Resources",
    description:
      "Datasets are structured data files (CSV, Parquet) managed by the `data-service` service. Resource groups bundle datasets, skills, and prompts together for workspace-level assignment.",
    match: (name) =>
      ["datasets", "dataset_versions", "dataset_metadata_history",
       "workspace_dataset_privs", "workspace_dataset_metadata", "workspace_dataset_metadata_history",
       "resource_groups", "workspace_resource_collections"].includes(name),
  },
  {
    id: "g5",
    name: "Skills & Prompts",
    description:
      "AI configuration layer. Skills are reusable python macros exposed via the MCP server. Prompts are custom system instructions injected into the LLM context.",
    match: (name) =>
      ["skills", "workspace_skill_privs", "prompts", "workspace_prompt_privs",
       "prompt_validation_runs", "workspace_generator_presets",
       "create_organization_skill"].includes(name),
  },
  {
    id: "g6",
    name: "Dashboards & Analytics",
    description:
      "Airline-theme dashboard feature. Dashboards contain widgets; widgets can be snapshotted for historical comparison.",
    match: (name) =>
      ["dashboards", "dashboard_widgets", "dashboard_widget_snapshots",
       "dashboard_audit_logs", "increment_dashboard_version"].includes(name),
  },
  {
    id: "g7",
    name: "API Usage & Metering",
    description:
      "Lightweight usage tracking for API calls made by authenticated users. `api_types` is a lookup table.",
    match: (name) =>
      ["api_calls", "api_types", "privileges"].includes(name),
  },
  {
    id: "g8",
    name: "Permissions Engine",
    description:
      "The async privilege recomputation system. Any mutation to access-granting tables enqueues affected users. A `pg_cron` job drains the queue and writes flat effective privileges to `effective_workspace_privs`.",
    match: (name) =>
      ["effective_workspace_privs", "privs_recompute_queue",
       "enqueue_privs_recompute", "enqueue_privs_recompute_for_workspace_users",
       "enqueue_privs_recompute_for_group_members", "drain_privs_recompute_queue",
       "recompute_effective_privs_for_subject", "get_effective_privs_for_subject_mv",
       "effective_workspace_privs_mv"].includes(name) ||
      name.startsWith("trg_") || name.startsWith("refresh_"),
  },
];

const UNGROUPED_GROUP = {
  id: "g0",
  name: "Uncategorized",
  description: "Tables and functions not yet assigned to a domain group.",
  match: () => true,
};

// ──────────────────────────────────────────────────────────────────────────────
// Parse database.types.ts to extract table definitions
// ──────────────────────────────────────────────────────────────────────────────
function parseTableDefinitions(content) {
  const tables = {};

  // Match: `      tableName: {\n        Row: {\n          col: type\n ...`
  const tableBlockRegex = /^\s{6}(\w+): \{[\s\S]*?(?=\n\s{6}\w+: \{|\n\s{4}\})/gm;
  let match;

  while ((match = tableBlockRegex.exec(content)) !== null) {
    const name = match[1];
    if (["Row", "Insert", "Update", "Relationships"].includes(name)) continue;

    const block = match[0];

    // Extract Row columns
    const rowMatch = block.match(/Row: \{([\s\S]*?)\}/);
    const columns = [];
    if (rowMatch) {
      const colRegex = /^\s+(\w+): ([^\n]+)/gm;
      let colMatch;
      while ((colMatch = colRegex.exec(rowMatch[1])) !== null) {
        columns.push({ name: colMatch[1], type: colMatch[2].trim().replace(/;$/, "") });
      }
    }

    // Extract FK relationships
    const relMatch = block.match(/Relationships: \[([\s\S]*?)\]/);
    const relationships = [];
    if (relMatch) {
      const fkRegex = /foreignKeyName: "([^"]+)"[\s\S]*?columns: \[([^\]]+)\][\s\S]*?referencedRelation: "([^"]+)"[\s\S]*?referencedColumns: \[([^\]]+)\]/g;
      let fkMatch;
      while ((fkMatch = fkRegex.exec(relMatch[1])) !== null) {
        relationships.push({
          fkName: fkMatch[1],
          columns: fkMatch[2].replace(/["\s]/g, "").split(","),
          refTable: fkMatch[3],
          refColumns: fkMatch[4].replace(/["\s]/g, "").split(","),
        });
      }
    }

    tables[name] = { name, columns, relationships };
  }

  return tables;
}

// ──────────────────────────────────────────────────────────────────────────────
// Parse triggers from migration files
// ──────────────────────────────────────────────────────────────────────────────
function parseTriggers(migrationsDir) {
  const triggers = [];
  if (!fs.existsSync(migrationsDir)) return triggers;

  for (const file of fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql"))) {
    const content = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    const triggerRegex = /create\s+(?:or\s+replace\s+)?trigger\s+(\w+)\s+(?:after|before)\s+(insert|update|delete|insert or update|insert or delete|update or delete)\s+on\s+public\.(\w+)/gi;
    let m;
    while ((m = triggerRegex.exec(content)) !== null) {
      triggers.push({ name: m[1], event: m[2].toUpperCase(), table: m[3] });
    }
  }
  return triggers;
}

// ──────────────────────────────────────────────────────────────────────────────
// Build Mermaid ER diagram for a group's tables
// ──────────────────────────────────────────────────────────────────────────────
function buildMermaidDiagram(groupTables, allTables) {
  const lines = ["```mermaid", "erDiagram"];

  // Entity definitions — limit columns to keep diagrams readable
  for (const t of groupTables) {
    if (!t.columns || t.columns.length === 0) continue;
    const safeName = t.name.toUpperCase().replace(/-/g, "_");
    lines.push(`    ${safeName} {`);
    const displayCols = t.columns.slice(0, 8); // cap at 8 to avoid overlong diagrams
    for (const col of displayCols) {
      // Sanitize types for Mermaid: strip nulls, arrays, generics
      const mType = col.type
        .replace(/\s*\|\s*null/g, "")
        .replace(/string/, "text")
        .replace(/number/, "integer")
        .replace(/boolean/, "bool")
        .replace(/Json/g, "jsonb")
        .replace(/\[\]/g, "[]")
        .split(" ")[0]
        .replace(/[^a-zA-Z0-9_\[\]]/g, "_")
        .substring(0, 20);
      lines.push(`        ${mType} ${col.name}`);
    }
    if (t.columns.length > 8) {
      lines.push(`        text _more_columns_`);
    }
    lines.push("    }");
  }

  // Relationships — only draw if both sides are in scope
  const groupTableNames = new Set(groupTables.map(t => t.name));
  const drawn = new Set();
  for (const t of groupTables) {
    for (const rel of (t.relationships || [])) {
      const key = `${t.name}__${rel.refTable}`;
      if (drawn.has(key)) continue;
      drawn.add(key);
      const left = t.name.toUpperCase().replace(/-/g, "_");
      const right = rel.refTable.toUpperCase().replace(/-/g, "_");
      lines.push(`    ${left} }o--|| ${right} : "${rel.fkName}"`);
    }
  }

  lines.push("```");
  return lines.join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// Render a column table for a single entity
// ──────────────────────────────────────────────────────────────────────────────
function renderColumnTable(table) {
  const lines = [`##### \`${table.name}\`\n`];
  if (table.columns.length === 0) {
    lines.push("_No column definitions found in generated types._\n");
    return lines.join("\n");
  }
  lines.push("| Column | Type | Notes |");
  lines.push("|--------|------|-------|");
  for (const col of table.columns) {
    const type = col.type.replace(/\s*\|\s*null/g, "").trim();
    const nullable = col.type.includes("| null") ? "nullable" : "";
    lines.push(`| \`${col.name}\` | \`${type}\` | ${nullable} |`);
  }

  if (table.relationships && table.relationships.length > 0) {
    lines.push("\n**Foreign Keys:**\n");
    for (const rel of table.relationships) {
      lines.push(`- \`${rel.columns.join(", ")}\` → \`${rel.refTable}.${rel.refColumns.join(", ")}\``);
    }
  }

  return lines.join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// Main document builder
// ──────────────────────────────────────────────────────────────────────────────
function buildDocument(tables, triggers) {
  const allTableNames = Object.keys(tables);

  // Classify tables into groups
  const grouped = new Map(DOMAIN_GROUPS.map(g => [g.id, { ...g, tables: [] }]));
  grouped.set(UNGROUPED_GROUP.id, { ...UNGROUPED_GROUP, tables: [] });

  const assigned = new Set();
  for (const name of allTableNames) {
    if (name.startsWith("old_remove_") || name === "old_remove_default_current_space") continue; // skip removed tables
    const group = DOMAIN_GROUPS.find(g => g.match(name)) || UNGROUPED_GROUP;
    grouped.get(group.id).tables.push(tables[name]);
    assigned.add(name);
  }

  const lines = [];

  // Document header
  lines.push(`---`);
  lines.push(`title: "04 Database Architecture"`);
  lines.push(`version: "3.0"`);
  lines.push(`generated: "${new Date().toISOString().split("T")[0]}"`);
  lines.push(`---`);
  lines.push("");
  lines.push(`# Database Architecture`);
  lines.push("");
  lines.push(`**Purpose**: Exhaustive documentation of the platform Supabase PostgreSQL schema.`);
  lines.push(`All tables, views, functions, and triggers are sourced from \`src/types/database.types.ts\``);
  lines.push(`and Supabase migration files. Re-generate with:`);
  lines.push("```bash");
  lines.push("node .agents/skills/documentation-generator/scripts/generate_db_docs.js");
  lines.push("```");
  lines.push("");
  lines.push("> For environment variable tracing and cross-service architecture, see [01-ecosystem-architecture.md](./01-ecosystem-architecture.md).");
  lines.push("> For the permissions engine deep-dive, see [06-security-layers.md](./06-security-layers.md).");
  lines.push("> For production deployment secrets, see the [Production Deployment Plan](../../planning/production-deployment/production-deployment-plan.md).");
  lines.push("");

  // Table of contents
  lines.push("## Table of Contents");
  lines.push("");
  for (const g of DOMAIN_GROUPS) {
    const grp = grouped.get(g.id);
    lines.push(`- [${g.name}](#${g.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}) (${grp.tables.length} objects)`);
  }
  lines.push("");

  // Render each group
  for (const g of DOMAIN_GROUPS) {
    const grp = grouped.get(g.id);
    if (grp.tables.length === 0) continue;

    lines.push(`---`);
    lines.push("");
    lines.push(`## ${g.name}`);
    lines.push("");
    lines.push(g.description);
    lines.push("");

    // ER Diagram
    lines.push("### Entity Diagram");
    lines.push("");
    lines.push(buildMermaidDiagram(grp.tables, tables));
    lines.push("");

    // Column tables per entity
    lines.push("### Table Definitions");
    lines.push("");
    for (const t of grp.tables) {
      lines.push(renderColumnTable(t));
      lines.push("");
    }

    // Triggers for this group's tables
    const groupTableNames = new Set(grp.tables.map(t => t.name));
    const groupTriggers = triggers.filter(tr => groupTableNames.has(tr.table));
    if (groupTriggers.length > 0) {
      lines.push("### Triggers");
      lines.push("");
      lines.push("| Trigger | Event | Table | Purpose |");
      lines.push("|---------|-------|-------|---------|");
      for (const tr of groupTriggers) {
        // Map known triggers to their purpose
        const purposes = {
          workspace_threads_privs_enqueue: "Enqueues affected users for privilege recompute",
          workspace_dataset_privs_enqueue: "Enqueues affected users when dataset-workspace link changes",
          workspace_skill_privs_enqueue: "Enqueues affected users when skill-workspace link changes",
          workspace_inheritance_privs_enqueue: "Enqueues affected users when workspace inheritance changes",
          user_workspace_privs_enqueue: "Enqueues user when direct workspace privilege changes",
          user_group_members_enqueue: "Enqueues group members when membership changes",
          workspace_user_group_privs_enqueue: "Enqueues group users when group-workspace priv changes",
          spaces_metadata_enqueue: "Enqueues workspace users when workspace metadata changes",
          workspace_prompt_privs_enqueue: "Enqueues users when prompt-workspace link changes",
          trg_workspace_generator_presets_updated_at: "Updates `updated_at` timestamp",
        };
        lines.push(`| \`${tr.name}\` | ${tr.event} | \`${tr.table}\` | ${purposes[tr.name] || "_see migration source_"} |`);
      }
      lines.push("");
    }
  }

  // RLS Policies summary
  lines.push("---");
  lines.push("");
  lines.push("## Row Level Security (RLS) Policy Summary");
  lines.push("");
  lines.push("All tables with RLS enabled enforce the following general pattern:");
  lines.push("");
  lines.push("| Pattern | Description |");
  lines.push("|---------|-------------|");
  lines.push("| Direct ownership | `auth.uid() = user_id` / `owner_id` |");
  lines.push("| Workspace membership | User has a record in `effective_workspace_privs` for the relevant workspace |");
  lines.push("| Super Admin bypass | Service role or users in the `super_admin` role group bypass all RLS |");
  lines.push("| Resource group link | Resource is reachable via `workspace_resource_collections` → workspace membership chain |");
  lines.push("");
  lines.push("> For the full list of named policies per table, inspect `supabase/migrations/*.sql`.");
  lines.push("Specific policies are enforced via the `check_workspace_access(input_workspace_id uuid)` helper function.");
  lines.push("");

  // Functions reference
  lines.push("---");
  lines.push("");
  lines.push("## Stored Functions Reference");
  lines.push("");
  lines.push("| Function | Signature | Purpose |");
  lines.push("|----------|-----------|---------|");
  lines.push("| `handle_new_user` | `() → trigger` | Mirrors `auth.users` → `public.users` on INSERT |");
  lines.push("| `sync_thread_from_storage` | `() → trigger` | Creates `threads` row when notebook uploaded to Storage |");
  lines.push("| `enqueue_privs_recompute` | `(p_user_id uuid)` | Deduped insert into recompute queue |");
  lines.push("| `enqueue_privs_recompute_for_workspace_users` | `(p_workspace_id uuid)` | Queues all users in a workspace |");
  lines.push("| `enqueue_privs_recompute_for_group_members` | `(p_group_id uuid)` | Queues all members of a group |");
  lines.push("| `drain_privs_recompute_queue` | `(p_limit int = 200)` | Drains queue entries, called by `pg_cron` |");
  lines.push("| `recompute_effective_privs_for_subject` | `(p_subject_type, p_subject_id, ...)` | Core privilege resolution — traverses hierarchy |");
  lines.push("| `get_effective_privs_for_subject_mv` | `(p_subject_type, p_subject_id, ...)` | Read helper against materialized view |");
  lines.push("| `check_workspace_access` | `(input_workspace_id uuid)` | RLS helper — returns true if caller can access workspace |");
  lines.push("| `create_organization_skill` | `(...)` | Creates a skill scoped to an org |");
  lines.push("| `increment_dashboard_version` | `(p_dashboard_id uuid)` | Atomically bumps dashboard version |");
  lines.push("| `set_workspace_generator_presets_updated_at` | `() → trigger` | Updates `updated_at` on preset mutations |");
  lines.push("");

  return lines.join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// Run
// ──────────────────────────────────────────────────────────────────────────────
console.log("📖 Reading database types from:", DB_TYPES_FILE);
const content = fs.readFileSync(DB_TYPES_FILE, "utf-8");

console.log("🔍 Parsing table definitions...");
const tables = parseTableDefinitions(content);
console.log(`   Found ${Object.keys(tables).length} tables/views/functions`);

console.log("🔍 Parsing triggers from migrations...");
const triggers = parseTriggers(MIGRATIONS_DIR);
console.log(`   Found ${triggers.length} triggers`);

console.log("📝 Generating documentation...");
const document = buildDocument(tables, triggers);

fs.writeFileSync(OUTPUT_FILE, document, "utf-8");
console.log(`✅ Documentation written to: ${OUTPUT_FILE}`);
console.log(`   Lines: ${document.split("\n").length}`);
