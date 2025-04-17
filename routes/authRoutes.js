// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.post('/logout', authController.logout);
module.exports = router;
