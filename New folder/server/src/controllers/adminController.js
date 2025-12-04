const userService = require('../services/userService');
const ordersService = require('../services/ordersService');

exports.listUsers = async (req, res, next) => {
  try {
    const users = await userService.getAll();
    // do not send passwords
    const safe = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
    res.json(safe);
  } catch (err) { next(err) }
}

exports.listOrders = async (req, res, next) => {
  try {
    const orders = await ordersService.getAll();
    res.json(orders);
  } catch (err) { next(err) }
}

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['paid', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const ok = await ordersService.updateStatus(id, status);
    if (!ok) return res.status(404).json({ message: 'Order not found' });
    const orders = await ordersService.getAll();
    res.json({ message: 'Status updated', orders });
  } catch (err) { next(err) }
}
