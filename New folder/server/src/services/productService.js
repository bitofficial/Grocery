const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson } = require('../models/fileDb');

const PRODUCTS_PATH = path.join(__dirname, '../../data/products.json');

async function getAll() {
  return (await readJson(PRODUCTS_PATH)) || [];
}

async function create(data) {
  const products = await getAll();
  const id = uuidv4();
  const product = {
    id,
    product_id: id,
    product_name: data.product_name,
    product_description: data.product_description,
    product_price: Number(data.product_price),
    qty: Number(data.qty || 0),
    image_url: data.image_url || '',
    category: data.category || 'General',
  };
  products.push(product);
  await writeJson(PRODUCTS_PATH, products);
  return product;
}

async function update(id, updates) {
  const products = await getAll();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return null;
  products[idx] = {
    ...products[idx],
    product_name: updates.product_name,
    product_description: updates.product_description,
    product_price: Number(updates.product_price),
    qty: Number(updates.qty || products[idx].qty),
    image_url: updates.image_url ?? products[idx].image_url,
    category: updates.category ?? products[idx].category,
  };
  await writeJson(PRODUCTS_PATH, products);
  return products[idx];
}

async function remove(id) {
  const products = await getAll();
  const before = products.length;
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === before) return false;
  await writeJson(PRODUCTS_PATH, filtered);
  return true;
}
async function decreaseStock(id, count) {
  const products = await getAll();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return false;

  // Ensure we don't go below zero
  const currentQty = Number(products[idx].qty || 0);
  const newQty = Math.max(0, currentQty - count);
  
  products[idx].qty = newQty;
  
  await writeJson(PRODUCTS_PATH, products);
  return true;
}

module.exports = {
  getAll,
  create,
  update,
  remove,
  decreaseStock
};

