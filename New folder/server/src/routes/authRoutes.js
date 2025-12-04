const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { requireAuth } = require('../services/sessionMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/session', authController.session);
router.post('/change-password', requireAuth, authController.changePassword);
router.put('/profile', requireAuth, authController.updateProfile);

module.exports = router;

