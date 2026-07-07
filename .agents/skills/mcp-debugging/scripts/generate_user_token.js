#!/usr/bin/env node

/**
 * Generate User Token for MCP Testing
 * 
 * Creates a valid user session token for a given user_id.
 * Uses a temporary password approach with Supabase Admin API.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log('\n🔐 Generate User Token for MCP Testing\n');

    // Check for required environment variables
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        console.error('❌ Error: Missing required environment variables');
        console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env\n');
        rl.close();
        process.exit(1);
    }

    // Create admin client
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log('Enter the user_id to generate a token for:');
    console.log('(Find user IDs in Supabase Dashboard → Authentication → Users)\n');

    const userId = await question('User ID: ');

    if (!userId.trim()) {
        console.error('\n❌ Error: User ID is required\n');
        rl.close();
        process.exit(1);
    }

    try {
        console.log('\n🔍 Fetching user...');

        // Verify user exists
        const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId.trim());

        if (userError || !userData.user) {
            console.error(`\n❌ Error: User not found with ID: ${userId.trim()}`);
            console.error('   Make sure the user_id is correct\n');
            rl.close();
            process.exit(1);
        }

        const userEmail = userData.user.email;
        console.log(`✅ Found user: ${userEmail || userData.user.id}`);

        if (!userEmail) {
            console.error('\n❌ Error: User has no email address');
            console.error('   This method requires the user to have an email\n');
            rl.close();
            process.exit(1);
        }

        console.log('\n🔑 Generating session token...');
        console.log('   (Creating temporary password and signing in)\n');

        // Generate a temporary password
        const tempPassword = crypto.randomBytes(32).toString('hex');

        // Update user with temporary password
        const { error: updateError } = await adminClient.auth.admin.updateUserById(
            userId.trim(),
            { password: tempPassword }
        );

        if (updateError) {
            console.error('\n❌ Error setting temporary password:', updateError.message);
            rl.close();
            process.exit(1);
        }

        // Create a new client for signing in
        const userClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY);

        // Sign in with the temporary password
        const { data: signInData, error: signInError } = await userClient.auth.signInWithPassword({
            email: userEmail,
            password: tempPassword
        });

        if (signInError) {
            console.error('\n❌ Error signing in:', signInError.message);
            rl.close();
            process.exit(1);
        }

        const accessToken = signInData.session.access_token;
        const refreshToken = signInData.session.refresh_token;

        // Sign out to clean up
        await userClient.auth.signOut();

        console.log('✅ Token generated successfully!');
        console.log('   (Temporary password has been used and session created)\n');

        displayToken(accessToken, refreshToken, userEmail);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\n💡 Alternative: Extract token from browser');
        console.error('   Run: node .agents/skills/mcp-debugging/scripts/extract_mcp_token.js\n');
    }

    rl.close();
}

function displayToken(accessToken, refreshToken, userEmail) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ User Session Token Generated!\n');
    console.log(`User: ${userEmail}`);
    console.log(`\nAccess Token:\n${accessToken}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 Next Steps:\n');
    console.log('1. Launch the MCP inspector:');
    console.log(`\n   bash .agents/skills/mcp-debugging/scripts/launch_mcp_inspector.sh \\\n     "${accessToken}" \\\n     YOUR_WORKSPACE_ID\n`);

    console.log('2. Or save to config for reuse:');
    console.log('   node .agents/skills/mcp-debugging/scripts/setup_test_config.js\n');

    console.log('⏰ Token expires after session timeout. Generate a new one if needed.\n');
    console.log('⚠️  Note: User password was temporarily changed during token generation.');
    console.log('   The user can reset it if needed, or continue using existing sessions.\n');
}

main().catch(error => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
});
