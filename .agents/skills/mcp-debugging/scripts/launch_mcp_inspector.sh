#!/bin/bash

# MCP Inspector Launcher
# Launches the MCP inspector with proper authentication and test context

MCP_SERVER_URL="https://dev-infra.example.com/mcp-server/mcp/"

echo "🚀 MCP Inspector Launcher"
echo ""

# Check if token is provided
if [ -z "$1" ]; then
    echo "❌ Error: Access token required"
    echo ""
    echo "Usage: $0 <ACCESS_TOKEN> [WORKSPACE_ID]"
    echo ""
    echo "Arguments:"
    echo "  ACCESS_TOKEN  - Required. Supabase access token for authentication"
    echo "  WORKSPACE_ID      - Optional. Workspace ID for testing (will be shown in inspector)"
    echo ""
    echo "To get your access token, run:"
    echo "  node .agents/skills/mcp-debugging/scripts/extract_mcp_token.js"
    echo ""
    echo "Example:"
    echo "  $0 eyJhbGc... a07091c8-ab47-4ff5-9a39-133e4b1"
    echo ""
    exit 1
fi

ACCESS_TOKEN="$1"
WORKSPACE_ID="${2:-}"

echo "📡 MCP Server: $MCP_SERVER_URL"
echo "🔑 Authentication: Bearer token configured"
echo "   (User ID is automatically extracted from the token)"
echo ""

if [ -n "$WORKSPACE_ID" ]; then
    echo "📦 Test Workspace ID: $WORKSPACE_ID"
else
    echo "📦 Workspace ID: Not set (you'll need to provide it in tool calls)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Testing Tips:"
echo ""

if [ -n "$WORKSPACE_ID" ]; then
    echo "   When testing tools, use this workspace_id in your parameters:"
    echo "   {\"workspace_id\": \"$WORKSPACE_ID\", ...}"
else
    echo "   To find your workspace_id:"
    echo "   - Check browser console logs for: WORKSPACE_ID: <your-id>"
    echo "   - Or check Network tab → /api/ai/actions/action → Request Payload"
fi

echo ""
echo "   Note: workspace_id is automatically injected in production,"
echo "   but must be provided manually in the inspector."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Starting inspector..."
echo ""

# Launch the inspector with authentication
npx @modelcontextprotocol/inspector \
  --server-url "$MCP_SERVER_URL" \
  --transport http \
  --header "Authorization: Bearer $ACCESS_TOKEN" \
  --header "x-access-token: $ACCESS_TOKEN"
