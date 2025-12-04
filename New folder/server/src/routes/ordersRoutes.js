const express = require('express');
const router = express.Router();
const { requireAuth } = require('../services/sessionMiddleware');
const ordersController = require('../controllers/ordersController');

router.post('/orders', requireAuth, ordersController.create);
router.get('/orders', requireAuth, ordersController.history);

module.exports = router;

