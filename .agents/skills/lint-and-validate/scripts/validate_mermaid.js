const fs = require('fs');
const path = require('path');

// Simple regex to catch the most common error: unquoted workspaces in subgraph names
// Valid: subgraph EKS["AWS EKS Cluster"]
// Valid: subgraph EKS [AWS_EKS_Cluster]
// Invalid: subgraph AWS EKS Cluster [example-app-infra]
const invalidSubgraphRegex = /subgraph\s+(?!.*\[.*\])[^\n"]+\s+[^\n"]+/g;

// Another common error: workspaces in node IDs without quotes. 
// However, mermaid allows `ID[Label with workspaces]`. The ID itself cannot have workspaces.
const invalidNodeIdRegex = /^\s*([a-zA-Z0-9_]+\s+[a-zA-Z0-9_]+)\s*\[/gm;

function validateMermaidBlocks(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const mermaidRegex = /```mermaid([\s\S]*?)```/g;
    let match;
    let hasErrors = false;

    while ((match = mermaidRegex.exec(content)) !== null) {
        const block = match[1];
        
        // Check for invalid subgraph syntax where there are workspaces but no quotes or explicit labels
        const lines = block.split('\n');
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('subgraph ')) {
                // If it contains workspaces but doesn't have ["..."] or [...] we flag it.
                // It's a heuristic, but it catches the exact error we had.
                const hasBrackets = trimmed.includes('[');
                const hasQuotes = trimmed.includes('"');
                if (!hasBrackets && !hasQuotes && trimmed.split(' ').length > 2) {
                    console.error(`\x1b[31m[ERROR]\x1b[0m ${filePath}: Invalid subgraph syntax on line: "${trimmed}"`);
                    console.error(`        Use subgraph ID["Label with workspaces"] instead.`);
                    hasErrors = true;
                }
            } else {
                // Check for workspaces in node IDs only if it's not a subgraph line
                if (invalidNodeIdRegex.test(trimmed)) {
                    console.error(`\x1b[31m[ERROR]\x1b[0m ${filePath}: Invalid Node ID syntax (workspaces in ID) on line: "${trimmed}"`);
                    hasErrors = true;
                }
            }
        });
    }
    return !hasErrors;
}

function walkDir(dir) {
    let files = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git')) {
                files = files.concat(walkDir(file));
            }
        } else if (file.endsWith('.md')) {
            files.push(file);
        }
    });
    return files;
}

const docsDir = path.join(process.cwd(), 'documentation');
if (!fs.existsSync(docsDir)) {
    console.error("Documentation directory not found.");
    process.exit(1);
}

const mdFiles = walkDir(docsDir);
let allPassed = true;

mdFiles.forEach(file => {
    if (!validateMermaidBlocks(file)) {
        allPassed = false;
    }
});

if (!allPassed) {
    console.error("\x1b[31mMermaid validation failed. Please fix the above errors.\x1b[0m");
    process.exit(1);
} else {
    console.log("\x1b[32mAll Mermaid diagrams passed basic syntax validation.\x1b[0m");
    process.exit(0);
}
