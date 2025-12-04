const fs = require('fs');
const fsp = require('fs').promises;

async function ensureFile(filePath) {
  try {
    await fsp.access(filePath, fs.constants.F_OK);
  } catch (_) {
    await fsp.mkdir(require('path').dirname(filePath), { recursive: true });
    await fsp.writeFile(filePath, '[]', 'utf-8');
  }
}

async function readJson(filePath) {
  await ensureFile(filePath);
  const raw = await fsp.readFile(filePath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

async function writeJson(filePath, data) {
  await ensureFile(filePath);
  await fsp.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readJson, writeJson };

