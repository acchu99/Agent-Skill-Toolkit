---
name: mcp-integration-adv
description: Advanced patterns for MCP tools, shared memory, and UI rendering.
---

# Advanced MCP Integration Patterns

This skill defines the high-level coordination between MCP tools, the Python Jupyter kernel, and the application frontend.

## 1. Memory Boundary (CRITICAL)

the application uses two distinct persistence layers. Choosing the wrong one causes `NameError` or data loss.

| Feature | NATIVE MCP Tool (`save_memory`) | PYTHON Accessor (`example-app_client.memory`) |
|---------|---------------------------------|-----------------------------------------|
| **Source** | JSON from AI context | Result of code execution (DF, Figures) |
| **Persistence** | Immediate (Supabase) | Session-scoped (RPC Backend) |
| **Access** | Browser/Other Agents | High-speed Python access |

### Rule of Thumb
- Use `save_memory` for **static data** or **final summaries**.
- Use `example-app_client.memory['key'] = val` for **live objects** generated in Python.

## 2. Environment Context
Every tool call to an MCP server (e.g., `example-app-datasets-mcp`) includes an `env` dictionary.
- **Trust:** MCP tools are trusted processes; they use these variables to authenticate against Supabase or other internal APIs.
- **Lifecycle:** This context is request-scoped and non-persistent on the MCP server side.

## 3. UI Interpolation via Markdown
To render a graphical representation of memory (e.g., the Memory Viewer), use the `{{key}}` syntax in Markdown cells.

### Workflow
1. **Save:** `save_memory(key="sales_summary", ...)`
2. **Reference:** "I've saved the analysis here: {{sales_summary}}"
3. **Frontend:** Detects `{{sales_summary}}` and builds the interactive widget.

## 4. MIME-Type Rendering
For tools or skills that return `text/html` or `application/javascript`:
- **Protocol:** Start the cell with `%%html` or `%%javascript`.
- **Enforcement:** Ensure `cell_type: "code"` is used to trigger execution.
