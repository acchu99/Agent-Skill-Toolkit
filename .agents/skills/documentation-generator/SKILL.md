---
name: documentation-generator
description: Dynamically generates and updates comprehensive project documentation using codebase introspection.
allowed-tools: Read, Glob, Grep
---

# Documentation Generation Skill

**Version**: 1.0  
**Purpose**: This skill transforms a codebase into a complete, maintainable documentation suite organized as GitHub Markdown files. It emphasizes dynamic introspection, meaning the agent reads the actual source code, migrations, routes, and infrastructure definitions before documenting behavior.

The resulting documentation lives directly in the project repo in a flat `documentation/` folder, making it version-controlled, highly searchable, and easy to maintain without manual overhead.

---

## Core Philosophy

1. **Introspection-First**: Documentation must reflect reality. Before writing about the backend, the agent MUST read `supabase/migrations/*` and `src/app/api/*` to document actual tables, RPCs, functions, and triggers.
2. **Ecosystem-Aware**: Treat the project as a system, not just a web app. Document connected services, jobs, infrastructure, APIs, and operational boundaries when they exist.
3. **Flat Hierarchy**: The `documentation/` folder should remain relatively flat (prefixing files logically, e.g., `01-`, `02-`) rather than using deep nesting that requires users to click through multiple levels.
4. **Visual & Markdown-Native**: Use Mermaid diagrams extensively for architecture, sequencing, and DB schemas. Stick to standard GitHub Markdown (no static site generators like MkDocs).
5. **Actionable**: Every API, permission model, and deployment step should be explained clearly enough for a new engineer to execute.

---

## Output Structure

The agent **must** create or update files inside the `documentation/` directory at the project root:

```text
project/
├── documentation/
│   ├── README.md                              # Entry point, ecosystem overview, and contribution guide
│   ├── 00-product-overview.md                 # Deep objectives, business context, workflow diagrams
│   ├── 01-ecosystem-architecture.md           # App, services, jobs, integrations, infra
│   ├── 01b-request-lifecycle.md               # End-to-end scenario flows (Happy/Failure paths)
│   ├── 02-ui-architecture.md                  # Next.js, Context/Zustand state, layout components
│   ├── 03-api-architecture.md                 # Server actions, Next.js API route mappings
│   ├── 04-database-architecture.md            # Schema, RLS, functions, triggers, ER diagrams
│   ├── 05-server-specifications.md            # Infrastructure specs (EKS nodes, Vercel compute)
│   ├── 06-security-layers.md                  # JWT flows, specific vulnerabilities, RLS barriers
│   ├── 07-feature-authentication-login.md     # Auth feature deep dive
│   ├── 08-feature-workspaces-management.md    # Workspace or tenant management deep dive
│   ├── 09-feature-resource-collections.md     # Resource grouping deep dive
│   ├── 10-feature-dashboards.md               # Dashboard rendering and interaction deep dive
│   ├── 11-feature-compute-integration.md      # Background or interactive compute deep dive
│   ├── 12-feature-ai-tooling.md               # AI tool/server interactions deep dive
│   ├── 13-git-information.md                  # Repositories and branches
│   ├── 14-qa-report.md                        # Playwright automation, load test strategies
│   └── assets/
│       └── screenshots/                       # High-res PNGs generated via Playwright
```

---

## Execution Process (Agent Instructions)

When an agent is invoked with this skill to "update or generate documentation", it must follow these steps:

### Phase 0: Zero-Hallucination Audit (Mandatory Pre-Step)
Before writing or updating a lifecycle or architecture document, you MUST:
1. **Verify API Routes**: Run `find src/pages/api -maxdepth 3` to list ACTUAL available endpoints. DO NOT assume URL paths based on component names.
2. **Trace System Logic**: Grep the `src/` directory for core utilities like `saveApiCallToSupabase` or `captureException` to locate where metering, auth, and observability are actually implemented (e.g., `src/proxy.ts` vs `src/pages/api/_shared/`).
3. **Cross-Repo Verification**: If a workflow touches infrastructure or another service, search the related repo for the specific scripts, manifests, or configs.

### Phase 1: Codebase Introspection (Mandatory)
1. **Database & Backend**:
   - Glob/Grep the `supabase/migrations/` directory.
   - Extract the list of Tables, Views, Functions, Procedures (RPCs), and Triggers.
   - Identify the Row Level Security (RLS) or authorization model and how tenant/workspace/resource relationships dictate privileges.
2. **API & Routes**:
   - Glob/Grep `src/app/api/` and `src/actions/` (or similar Next.js data fetching layers).
   - Trace which API endpoints call which Supabase RPCs/functions.
3. **Infrastructure (Terraform Mapping)**:
   - Review deployment plans, `docker-compose.yaml`, Kubernetes manifests, and Terraform files when present.
   - Specifically map out resources like `aws_eks_cluster`, `aws_node_group`, `aws_s3_bucket`, and networking to generate accurate deployment architectures.

### Phase 2: Content Generation & Update
Update or create the `.md` files based on the findings.

#### Feature Documents (Files 07 through 12)
These files MUST be exhaustive (modeled after the ST 3.0 standard). Each feature document MUST include:
1. **Purpose & Value**: What the feature does.
2. **Entry Points**: How to navigate to it.
3. **UI Breakdown**: What is on the screen.
4. **Interaction Flows**: Detailed numbered steps + Mermaid flowchart.
5. **Business Logic & Calculations**: Complex rules or formulas.
6. **Data & API**: Which specific `03-api-architecture.md` and `04-database-architecture.md` components it touches. Use absolute file paths in descriptions.
7. **Edge Cases & Failure Modes**: Document what happens when the feature *fails* (OOM, Timeouts, 402/429 limits).
8. **Screenshots**: Injected from the Playwright assets.

#### Crucial Focus: `01b-request-lifecycle.md`
This file MUST use Mermaid `sequenceDiagram` for every scenario. It is the "Engineering Support Guide" for the system.
- **Scenario Diversity**: Cover "Happy Paths" (Thread Creation, Auth) AND "Operational Maintenance" (Idle Culling, PVC Cleaning).
- **Observability Mapping**: Tag each flow with Sentry/Langfuse/CloudWatch trigger points.
- **Auth/Metering Barriers**: Explicitly document where 401/402/403/429 errors are generated.

#### Crucial Focus: `04-database-architecture.md`
This file must contain:
- **Mermaid ER Diagrams**: Showing relationships between users, tenants/workspaces, resources, and privileges.
- **Function/Trigger Dictionary**: A table detailing every major Supabase function, what it does, and what triggers it.
- **RLS & Permissions**: Detailed explanation of the recompute privilege pipeline and dependency logic.

#### Crucial Focus: `01-ecosystem-architecture.md`
Must include a `graph LR` or `graph TD` Mermaid diagram mapping how the app communicates with internal services, AI/tool servers, workers, and external integrations.

### Phase 3: Visuals and Formatting
- Always use **bold** for UI elements and *italics* for statuses.
- Embed Mermaid diagrams using standard fenced code blocks. Ensure architecture diagrams match the Terraform reality.
- Ensure all relative links between `.md` files in `documentation/` are intact.

### Phase 4: Visual Generation (Screenshots)
1. Instruct the user or system to run the Playwright documentation screenshot generator:
   `npx playwright test documentation-screenshots.spec.ts`
2. **Scan the Inventory**: Read the `documentation/assets/screenshots/README.md` or list the directory to verify the EXACT filenames.
3. **Map Contextually**: Automatically inject Markdown image tags (e.g., `![Dashboard View](./assets/screenshots/05-features-core-dashboard.png)`) into the appropriate sections.

---

## 💡 Best Practices & Gotchas

### 🧬 Mermaid Robustness
- **Quote All Labels**: To prevent lexical errors in various Markdown renderers (GitHub, VSCode, etc.), always wrap labels in double quotes if they contain special characters: `(` , `)` , `/` , `+` , `[` , `]`, or JSON syntax.
    - ✅ `JH["JupyterHub (EKS)"]`
    - ❌ `JH[JupyterHub (EKS)]`
- **Verify Block Closure**: When using automated tools to append content, ensure triple backticks (```) are correctly placed and not nested inside other blocks.
- **Escape Special Chars**: Inside quoted labels, use single quotes for JSON strings: `"{ 'theme': 'airline' }"`.

### 📸 Screenshot Precision
- **Filename Parity**: Playwright-generated filenames often differ from design-time placeholders. Always cross-reference the `documentation/assets/screenshots/` inventory before linking.
- **Relative Paths**: Always use relative paths starting with `./assets/screenshots/` to ensure portability.

---

## How to Invoke This Skill
If you need to update the documentation after making a major change to the database or an API, invoke the agent with:
> "Use the documentation-generator skill to update the backend documentation to reflect the new resource permission triggers we just added."

The agent will read this skill, perform introspection on the migrations, and update `documentation/03-backend-and-db.md` automatically.
