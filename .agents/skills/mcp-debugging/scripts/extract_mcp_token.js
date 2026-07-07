#!/usr/bin/env node

/**
 * MCP Token Extractor
 * 
 * Extracts a REAL USER access token from the browser for MCP testing.
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔐 MCP Token Extractor\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('⚠️  IMPORTANT: The most reliable method is the Network Tab.\n');
console.log('LocalStorage might be empty or restricted.\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📝 How to get a WORKING token:\n');

console.log('1. Open your app in the browser');
console.log('2. Open DevTools (F12) → Network tab');
console.log('3. Run a query (AI Query) in the app');
console.log('4. Find the request: "action" (or /api/ai/actions/action)');
console.log('5. Click Headers tab');
console.log('6. Copy the value of "x-access-token" (in Request Headers)\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('💡 Once you have the token:\n');
console.log('Launch the inspector:');
console.log('bash .agents/skills/mcp-debugging/scripts/launch_mcp_inspector.sh TOKEN WORKSPACE_ID\n');

rl.close();
