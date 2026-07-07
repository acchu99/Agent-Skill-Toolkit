#!/usr/bin/env node

/**
 * MCP Quick Test Setup
 * 
 * Interactive script to set up MCP testing.
 * Generates a token for a user_id, then configures workspace_id.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');

const CONFIG_FILE = path.join(process.cwd(), '.mcp-test-config');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function generateToken(userId) {
    return new Promise((resolve, reject) => {
        const tokenScript = path.join(__dirname, 'generate_token.js');
        const child = spawn('node', [tokenScript], {
            stdio: ['pipe', 'pipe', 'inherit']
        });

        let output = '';
        child.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            process.stdout.write(text);
        });

        // Send user_id to the script
        child.stdin.write(userId + '\n');
        child.stdin.end();

        child.on('close', (code) => {
            if (code === 0) {
                // Extract token from output
                const tokenMatch = output.match(/Token: (.+)/);
                if (tokenMatch) {
                    resolve(tokenMatch[1].trim());
                } else {
                    reject(new Error('Could not extract token from output'));
                }
            } else {
                reject(new Error(`Token generation failed with code ${code}`));
            }
        });
    });
}

async function main() {
    console.log('\n🔧 MCP Test Configuration Setup\n');

    // Check for existing config
    let existingConfig = {};
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const content = fs.readFileSync(CONFIG_FILE, 'utf8');
            existingConfig = content.split('\n').reduce((acc, line) => {
                const [key, value] = line.split('=');
                if (key && value) acc[key.trim()] = value.trim();
                return acc;
            }, {});

            console.log('📋 Found existing configuration:');
            console.log(`   Workspace ID: ${existingConfig.WORKSPACE_ID || 'Not set'}`);
            console.log(`   Token: ${existingConfig.ACCESS_TOKEN ? '***' + existingConfig.ACCESS_TOKEN.slice(-8) : 'Not set'}`);
            console.log('');

            const useExisting = await question('Use existing config? (y/n): ');
            if (useExisting.toLowerCase() === 'y') {
                console.log('\n✅ Using existing configuration!\n');
                printUsage(existingConfig);
                rl.close();
                return;
            }
        } catch (error) {
            console.log('⚠️  Could not read existing config, creating new one.\n');
        }
    }

    console.log('Step 1: Generate Access Token\n');
    console.log('Enter the user_id to generate a token for:');
    console.log('(You can find user IDs in your Supabase auth.users table)\n');

    const userId = await question('User ID: ');

    if (!userId.trim()) {
        console.error('\n❌ Error: User ID is required\n');
        rl.close();
        process.exit(1);
    }

    let accessToken;
    try {
        console.log('');
        accessToken = await generateToken(userId.trim());
    } catch (error) {
        console.error('\n❌ Error generating token:', error.message);
        console.error('\n💡 You can manually enter a token if you have one:\n');
        accessToken = await question('Access Token (or press Enter to exit): ');
        if (!accessToken.trim()) {
            rl.close();
            process.exit(1);
        }
    }

    console.log('\nStep 2: Configure Workspace ID\n');
    console.log('💡 Tip: Run this script to find your workspace_id:');
    console.log('   node .agents/skills/mcp-debugging/scripts/extract_mcp_context.js\n');

    const workspaceId = await question('Workspace ID: ');

    const config = {
        ACCESS_TOKEN: accessToken.trim(),
        WORKSPACE_ID: workspaceId.trim()
    };

    // Save config
    const configContent = Object.entries(config)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync(CONFIG_FILE, configContent);
    console.log(`\n✅ Configuration saved to ${CONFIG_FILE}\n`);

    // Add to .gitignore if not already there
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf8');
        if (!gitignore.includes('.mcp-test-config')) {
            fs.appendFileSync(gitignorePath, '\n# MCP testing config\n.mcp-test-config\n');
            console.log('✅ Added .mcp-test-config to .gitignore\n');
        }
    }

    printUsage(config);
    rl.close();
}

function printUsage(config) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 Launch MCP Inspector:\n');

    const cmd = `bash .agents/skills/mcp-debugging/scripts/launch_mcp_inspector.sh ${config.ACCESS_TOKEN}${config.WORKSPACE_ID ? ' ' + config.WORKSPACE_ID : ''}`;
    console.log(`   ${cmd}\n`);

    console.log('📋 Or copy this command:\n');
    console.log(`   export MCP_TOKEN="${config.ACCESS_TOKEN}"`);
    console.log(`   export MCP_WORKSPACE_ID="${config.WORKSPACE_ID}"`);
    console.log('   bash .agents/skills/mcp-debugging/scripts/launch_mcp_inspector.sh $MCP_TOKEN $MCP_WORKSPACE_ID\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
