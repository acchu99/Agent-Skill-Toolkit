#!/usr/bin/env node

/**
 * MCP Token Helper
 * 
 * IMPORTANT: For MCP testing, you MUST use a real user access token.
 * The service role key will NOT work with the MCP server.
 */

console.log('\n🔐 MCP Token Helper\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('⚠️  IMPORTANT: Service Role Key Does NOT Work for MCP!\n');
console.log('The MCP server requires a REAL USER access token.');
console.log('You must extract a token from a logged-in user session.\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📝 To get a user access token:\n');
console.log('Run: node .agents/skills/mcp-debugging/scripts/extract_mcp_token.js\n');

console.log('This will show you how to extract a token from your browser.\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
