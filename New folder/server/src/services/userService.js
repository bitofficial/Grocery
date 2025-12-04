const path = require('path');
const { readJson, writeJson } = require('../models/fileDb');

const USERS_PATH = path.join(__dirname, '../../data/users.json');

async function getAll() {
  return (await readJson(USERS_PATH)) || [];
}

async function findByEmail(email) {
  const users = await getAll();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

async function findById(id) {
  const users = await getAll();
  return users.find(u => u.id === id);
}

async function addUser(user) {
  const users = await getAll();
  users.push(user);
  await writeJson(USERS_PATH, users);
}

async function updatePassword(id, hashedPassword) {
  const users = await getAll();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  users[idx].password = hashedPassword;
  await writeJson(USERS_PATH, users);
  return true;
}

async function updateProfile(id, { name, email }) {
  const users = await getAll();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  
  // Check if new email is already taken by another user
  if (email && email.toLowerCase() !== users[idx].email.toLowerCase()) {
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== id);
    if (emailExists) return null; // Email already taken
  }
  
  if (name) users[idx].name = name;
  if (email) users[idx].email = email;
  await writeJson(USERS_PATH, users);
  return users[idx];
}

module.exports = {
  getAll,
  findByEmail,
  findById,
  addUser,
  updatePassword,
  updateProfile,
};

