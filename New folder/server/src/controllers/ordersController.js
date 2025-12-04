const ordersService = require('../services/ordersService');
const productService = require('../services/productService');

exports.create = async (req, res, next) => {
  try {
    const { items, address, payment_method } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'No items' });
    const products = await productService.getAll();
    const detailed = [];
    for (const it of items) {
      const p = products.find(x => x.id === it.product_id);
      if (!p) return res.status(400).json({ message: 'Invalid item' });
      const qty = Number(it.qty || 0);
      if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ message: 'Invalid qty' });
      detailed.push({ product_id: p.id, product_name: p.product_name, price: p.product_price, qty });
    }
    const order = await ordersService.create({ user_id: req.session.user.id, items: detailed, address, payment_method });
    // decrement stock for each item
    for (const item of detailed) {
      await productService.decreaseStock(item.product_id, item.qty);
    }
    res.status(201).json(order);
  } catch (err) { next(err) }
};
exports.history = async (req, res, next) => {
  try {
    // We can safely access req.session.user.id because this route will be protected by requireAuth
    const userId = req.session.user.id;
    const orders = await ordersService.getByUserId(userId);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

