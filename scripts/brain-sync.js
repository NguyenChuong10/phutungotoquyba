#!/usr/bin/env node
/**
 * Brain Sync Script - Automated Git Hook & Memory Update
 * Runs git diff --name-only HEAD~1 HEAD and syncs project-brain/memory-graph.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const memoryGraphFile = path.join(projectRoot, 'project-brain', 'memory-graph.json');

console.log('[Brain Sync] Running Automated Git Commit Sync...');

try {
  const diffOutput = execSync('git diff --name-only HEAD~1 HEAD', { cwd: projectRoot, encoding: 'utf8' });
  const changedFiles = diffOutput.trim().split('\n').filter(Boolean);
  
  console.log(`[Brain Sync] Detected ${changedFiles.length} changed files in last commit:`);
  changedFiles.forEach(f => console.log(`  - ${f}`));

  if (fs.existsSync(memoryGraphFile)) {
    const graphData = JSON.parse(fs.readFileSync(memoryGraphFile, 'utf8'));
    graphData.updatedAt = new Date().toISOString();
    graphData.lastCommitFiles = changedFiles;
    fs.writeFileSync(memoryGraphFile, JSON.stringify(graphData, null, 2), 'utf8');
    console.log('[Brain Sync] Memory Graph successfully synchronized!');
  }
} catch (err) {
  console.warn('[Brain Sync] Note: Initial commit or git diff skipped:', err.message);
}
