const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const { requireAuth, requireAdmin } = require('../services/sessionMiddleware');

// Customer-facing: view products (public - no auth required for browsing)
router.get('/products', productController.list);

// Admin CRUD
router.post('/admin/products', requireAdmin, productController.create);
router.put('/admin/products/:id', requireAdmin, productController.update);
router.delete('/admin/products/:id', requireAdmin, productController.remove);

module.exports = router;

