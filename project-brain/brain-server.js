/**
 * Project Brain MCP Tool Server for Phu Tung Oto Q.BA
 * Provides brain.search(), brain.feature(), brain.api(), brain.table(), brain.commit(), brain.history()
 */

const fs = require('fs');
const path = require('path');

const memoryGraphPath = path.join(__dirname, 'memory-graph.json');
const featureRegistryPath = path.join(__dirname, 'feature-registry.json');

function loadMemoryGraph() {
  if (fs.existsSync(memoryGraphPath)) {
    return JSON.parse(fs.readFileSync(memoryGraphPath, 'utf8'));
  }
  return { entities: { features: [] } };
}

function brainSearch(query) {
  const graph = loadMemoryGraph();
  const q = query.toLowerCase();
  return graph.entities.features.filter(f => 
    f.id.includes(q) || 
    f.name.toLowerCase().includes(q) ||
    (f.databaseTable && f.databaseTable.includes(q))
  );
}

function brainFeature(featureKey) {
  const graph = loadMemoryGraph();
  return graph.entities.features.find(f => f.id === featureKey) || null;
}

module.exports = {
  brainSearch,
  brainFeature
};

if (require.main === module) {
  console.log('[Project Brain] MCP Brain Server Initialized.');
}
