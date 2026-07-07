#!/usr/bin/env node

/**
 * MCP Context Extractor
 * 
 * Extracts workspace_id from browser for MCP testing.
 * Note: user_id is automatically extracted from the JWT token by the MCP server.
 */

const chalk = require('chalk');

console.log(chalk.bold.cyan('\n🔍 MCP Test Context Extractor\n'));

console.log(chalk.yellow('This script helps you extract the workspace_id for MCP testing.'));
console.log(chalk.yellow('The user_id is automatically extracted from your JWT token.\n'));

console.log(chalk.bold('Method 1: From Browser Console (Recommended)\n'));
console.log('1. Open your platform app in the browser');
console.log('2. Make an AI Query (any query)');
console.log('3. Open DevTools (F12 or Cmd+Option+I)');
console.log('4. Go to the ' + chalk.bold('Console') + ' tab');
console.log('5. Look for the log line:\n');

console.log(chalk.green('   WORKSPACE_ID: <your-workspace-id> Effective User: <user-id>\n'));

console.log('6. Copy the WORKSPACE_ID value for use with the inspector\n');

console.log(chalk.bold('Method 2: From Network Tab\n'));
console.log('1. Open DevTools → ' + chalk.bold('Network') + ' tab');
console.log('2. Make an AI Query in the app');
console.log('3. Find the request to ' + chalk.cyan('/api/ai/actions/action'));
console.log('4. Click on it → ' + chalk.bold('Payload') + ' tab');
console.log('5. Expand ' + chalk.cyan('actionState') + ' object');
console.log('6. Find: ' + chalk.cyan('actionState.workspaceId.workspace_id') + ' → Your workspace ID\n');

console.log(chalk.bold('Method 3: Extract Programmatically\n'));
console.log('Paste this code in the browser console:\n');

console.log(chalk.green(`
   // Extract MCP test context
   (async () => {
     try {
       const response = await fetch('/api/workspaces/current');
       const data = await response.json();
       const workspaceId = data.workspace_id;
       
       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
       console.log('📦 Workspace ID:', workspaceId);
       console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
       console.log('\\n✅ Copy this value for MCP testing!');
       
       // Copy to clipboard
       copy(workspaceId);
       console.log('✅ Workspace ID copied to clipboard!');
     } catch (error) {
       console.error('❌ Error extracting workspace ID:', error);
     }
   })();
`));

console.log(chalk.bold.cyan('\nNext Steps:\n'));
console.log('Once you have your workspace_id, launch the inspector:\n');
console.log(chalk.green('  bash .agents/skills/mcp-debugging/scripts/launch_mcp_inspector.sh \\'));
console.log(chalk.green('    YOUR_ACCESS_TOKEN \\'));
console.log(chalk.green('    YOUR_WORKSPACE_ID\n'));

console.log(chalk.dim('Or use the /mcp-debug workflow for a guided experience.\n'));
