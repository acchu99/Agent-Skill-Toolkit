---
name: mcp-debugging
description: MCP debugging utilities for extracting authentication tokens and testing MCP tool calls with the inspector
---

# MCP Debugging Skill

This skill provides utilities to quickly extract MCP authentication tokens and parameters for debugging MCP tool calls using the `@modelcontextprotocol/inspector`.

## When to Use

- When debugging MCP tool call issues
- When testing MCP server endpoints manually
- When validating MCP tool schemas and responses
- When investigating authentication or authorization problems with MCP

## Available Scripts

### 1. `extract_mcp_token.js`

Extracts the Supabase access token from your browser's local storage for MCP authentication.

**Usage:**
```bash
node .agents/skills/mcp-debugging/scripts/extract_mcp_token.js
```

**What it does:**
- Provides instructions to extract the token from browser DevTools
- Shows how to use the token with the MCP inspector

### 2. `extract_mcp_context.js`

Extracts workspace_id and user_id from your browser for MCP testing.

**Usage:**
```bash
node .agents/skills/mcp-debugging/scripts/extract_mcp_context.js
```

**What it does:**
- Provides multiple methods to extract workspace_id and user_id
- Includes programmatic extraction via browser console
- Shows how to find these values in Network tab

### 3. `setup_test_config.js`

Interactive script to configure and save your MCP test context for easy reuse.

**Usage:**
```bash
node .agents/skills/mcp-debugging/scripts/setup_test_config.js
```

**What it does:**
- Prompts for access token, workspace_id, and user_id
- Saves configuration to `.mcp-test-config` file
- Automatically adds config file to `.gitignore`
- Provides ready-to-use launch commands

### 4. `launch_mcp_inspector.sh`

Launches the MCP inspector with authentication and optional test context.

**Usage:**
```bash
bash .agents/skills/mcp-debugging/scripts/launch_mcp_inspector.sh <ACCESS_TOKEN> [WORKSPACE_ID] [USER_ID]
```

**What it does:**
- Launches `npx @modelcontextprotocol/inspector` with the correct MCP server URL
- Automatically sets up authentication headers
- Displays configured workspace_id and user_id for reference
- Provides testing tips and guidance

## Quick Start

### Option A: One-Time Setup (Recommended)

**Step 1: Configure your test context**
```bash
node .agents/skills/mcp-debugging/scripts/setup_test_config.js
```

This will prompt you for your access token, workspace_id, and user_id, then save them for reuse.

**Step 2: Launch the inspector**

The setup script will show you the exact command to run. It will look like:
```bash
bash .agents/skills/mcp-debugging/scripts/launch_mcp_inspector.sh YOUR_TOKEN YOUR_WORKSPACE_ID YOUR_USER_ID
```

### Option B: Manual Setup

**Step 1: Extract your access token**
```bash
node .agents/skills/mcp-debugging/scripts/extract_mcp_token.js
```

**Step 2: Extract your test context**
```bash
node .agents/skills/mcp-debugging/scripts/extract_mcp_context.js
```

**Step 3: Launch the inspector**
```bash
bash .agents/skills/mcp-debugging/scripts/launch_mcp_inspector.sh YOUR_TOKEN YOUR_WORKSPACE_ID YOUR_USER_ID
```

### Step 4: Test MCP Tools

In the inspector, test tools with parameters like:
```json
{
  "workspace_id": "your-workspace-id",
  "dataset_name": "example_dataset"
}
```

**Note:** If you provided workspace_id when launching, use that same value in your tool calls.

## Key Information

### MCP Server Configuration

- **Server URL**: `https://dev-infra.example.com/mcp-server/mcp/`
- **Authentication**: Bearer token from Supabase session
- **Auto-injected Parameters**: `workspace_id` is automatically added to all tool calls

### Finding Your Workspace ID

Check browser console logs when making an AI Query - look for:
```
WORKSPACE_ID: <your-workspace-id> Effective User: <user-id>
```

Or check the application state for `actionState.workspaceId.workspace_id`.

## Troubleshooting

### Token Expired
If you get authentication errors, the token may have expired. Extract a fresh token from the browser.

### 401 Errors
The code automatically retries with a fresh client on 401 errors (see `action.ts` lines 2018-2026, 2105-2113).

### Tool Not Found
Verify the tool is registered by checking the MCP tools cache logs in the server console.

## Code References

- **MCP Client Setup**: [`action.ts:1403-1451`](file:///path/to/projects/app/src/pages/api/ai/actions/action.ts#L1403-L1451)
- **Token Extraction**: [`proxy.ts:168-170`](file:///path/to/projects/app/src/proxy.ts#L168-L170)
- **Tool Calling**: [`action.ts:2088-2130`](file:///path/to/projects/app/src/pages/api/ai/actions/action.ts#L2088-L2130)
