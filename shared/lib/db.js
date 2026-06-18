'use strict';
const Database = require('better-sqlite3');
const path = require('path');

const AGENTS_DIR = path.resolve(__dirname, '..', '..');

function openDb(agentName) {
  if (agentName === 'orchestrator') {
    return new Database(path.join(AGENTS_DIR, 'shared', 'orchestrator.db'));
  }
  return new Database(path.join(AGENTS_DIR, 'agents', agentName, 'knowledge.db'));
}

module.exports = { openDb, AGENTS_DIR };
