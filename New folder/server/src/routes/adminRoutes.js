const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../services/sessionMiddleware');

router.get('/users', requireAdmin, adminController.listUsers);
router.get('/orders', requireAdmin, adminController.listOrders);
router.patch('/orders/:id/status', requireAdmin, adminController.updateOrderStatus);

module.exports = router;
