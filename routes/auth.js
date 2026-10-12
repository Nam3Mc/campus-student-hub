const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { auth } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/status', auth, authController.status);
router.get('/logout', auth, authController.logout);

module.exports = router;