const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { readJson, writeJson } = require('../models/fileDb');

const ORDERS_PATH = path.join(__dirname, '../../data/orders.json');

async function create({ user_id, items, address, payment_method }) {
  const orders = (await readJson(ORDERS_PATH)) || [];
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);

  // Compute discount percent (same rules as frontend)
  let discountPercent = 0;
  if (total > 2000) discountPercent = 8;
  else if (total > 1000) discountPercent = 5;
  const discountAmount = (total * discountPercent) / 100;
  const priceAfterDiscount = total - discountAmount;
  const tax = priceAfterDiscount * 0.05; // 5% tax
  const paid_amount = Number((priceAfterDiscount + tax).toFixed(2));

  const shortId = Math.floor(100000 + Math.random() * 900000).toString();
  const order = {
    id: shortId,
    user_id,
    items,
    total,
    paid_amount,
    address,
    payment_method,
    status: 'paid',
    created_at: new Date().toISOString()
  };
  orders.push(order);
  await writeJson(ORDERS_PATH, orders);
  return order;
}



async function getByUserId(userId) {
  const orders = (await readJson(ORDERS_PATH)) || [];
  
  return orders
    .filter(o => o.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function getAll() {
  return (await readJson(ORDERS_PATH)) || [];
}

async function updateStatus(orderId, status) {
  const orders = (await readJson(ORDERS_PATH)) || [];
  const idx = orders.findIndex(o => String(o.id) === String(orderId));
  if (idx === -1) return false;
  orders[idx].status = status;
  await writeJson(ORDERS_PATH, orders);
  return true;
}



module.exports = { 
  create, 
  getByUserId, // Export the new function
  getAll,
  updateStatus,
};




