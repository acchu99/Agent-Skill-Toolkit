---
description: Extract MCP debugging tokens and launch inspector
---

# MCP Debug Workflow

This workflow helps you quickly extract authentication tokens and launch the MCP inspector for debugging tool calls.

## Steps

### Option A: Quick Setup (Recommended)

#### 1. Run Interactive Setup

// turbo
```bash
node .agents/skills/mcp-debugging/scripts/setup_test_config.js
```

This will:
- Prompt you for your access token, workspace_id, and user_id
- Save the configuration to `.mcp-test-config` for reuse
- Show you the exact command to launch the inspector

#### 2. Launch Inspector

Copy and run the command shown by the setup script. It will look like:

```bash
bash .agents/skills/mcp-debugging/scripts/launch_mcp_inspector.sh YOUR_TOKEN YOUR_WORKSPACE_ID YOUR_USER_ID
```

#### 3. Test MCP Tools

In the inspector, test tools using the workspace_id you configured:

```json
{
  "workspace_id": "your-configured-workspace-id",
  "dataset_name": "example_dataset"
}
```

### Option B: Manual Setup

#### 1. Extract Access Token

```bash
node .agents/skills/mcp-debugging/scripts/extract_mcp_token.js
```

Follow the instructions to extract the token from your browser.

#### 2. Extract Test Context

```bash
node .agents/skills/mcp-debugging/scripts/extract_mcp_context.js
```

This will show you how to find your workspace_id and user_id.

#### 3. Launch MCP Inspector

// turbo
```bash
chmod +x .agents/skills/mcp-debugging/scripts/launch_mcp_inspector.sh
```

Then run with your extracted values:

```bash
bash .agents/skills/mcp-debugging/scripts/launch_mcp_inspector.sh YOUR_TOKEN YOUR_WORKSPACE_ID YOUR_USER_ID
```

#### 4. Test MCP Tools

In the inspector, test tools with your configured context:

```json
{
  "workspace_id": "your-workspace-id",
  "dataset_name": "example_dataset"
}
```

## Troubleshooting

### Token Expired
If you get 401 errors, extract a fresh token from the browser (repeat steps 1-2).

### Inspector Won't Start
Make sure you have the MCP inspector package available:
```bash
npm install -g @modelcontextprotocol/inspector
```

### Can't Find Workspace ID
- Make an AI Query in your app
- Open browser DevTools Console
- Look for the log line starting with "WORKSPACE_ID:"
- Or check Network tab for the relevant MCP request payload and workspace context field.

## Quick Reference

- **MCP Server URL**: `https://dev-infra.example.com/mcp-server/mcp/`
- **Token Location**: Browser localStorage (Supabase auth token)
- **Auto-injected Params**: `workspace_id` (in production, not in inspector)
