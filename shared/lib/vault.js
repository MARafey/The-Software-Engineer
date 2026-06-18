'use strict';
const fs = require('fs');
const path = require('path');
const { AGENTS_DIR } = require('./db');

function getVaultPath(agentName) {
  return path.join(AGENTS_DIR, 'agents', agentName, 'vault');
}

function readIndexMd(agentName) {
  const indexPath = path.join(getVaultPath(agentName), 'INDEX.md');
  return fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
}

function readNote(agentName, relativePath) {
  const fullPath = path.join(getVaultPath(agentName), relativePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : null;
}

function writeNote(agentName, relativePath, content) {
  const fullPath = path.join(getVaultPath(agentName), relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  return fullPath;
}

function appendDecision(agentName, sessionId, content) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `decisions/${timestamp}-${sessionId.slice(0, 8)}.md`;
  writeNote(agentName, filename, content);
  return filename;
}

function listNotes(agentName, subfolder) {
  const dir = path.join(getVaultPath(agentName), subfolder || '');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(subfolder || '', f).replace(/\\/g, '/'));
}

function updateIndexMd(agentName) {
  const vaultPath = getVaultPath(agentName);
  const rows = [];
  function walk(dir, base) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = base ? `${base}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), rel);
      } else if (entry.name.endsWith('.md') && entry.name !== 'INDEX.md') {
        const mtime = fs.statSync(path.join(dir, entry.name)).mtime.toISOString().slice(0, 10);
        rows.push(`| [${rel}](${rel}) | | ${mtime} |`);
      }
    }
  }
  walk(vaultPath, '');
  const table = [
    `# ${agentName} Agent — Vault Index`,
    '',
    '| File | Topics | Last Updated |',
    '|------|--------|--------------|',
    ...rows,
  ].join('\n');
  fs.writeFileSync(path.join(vaultPath, 'INDEX.md'), table + '\n', 'utf8');
}

module.exports = { getVaultPath, readIndexMd, readNote, writeNote, appendDecision, listNotes, updateIndexMd };
