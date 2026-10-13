const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authController = require('../controllers/auth');
const { auth } = require('../middleware/auth');

// Local auth
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/status', auth, authController.status);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['openid', 'profile', 'email'],
    prompt: 'select_account',
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/google/failure',
    session: true,
  }),
  (req, res) => {
    // 1. Genera el JWT — exactamente igual que en /auth/login
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 2. Redirige al frontend pasando el token en el hash
    //    (los hashes no viajan al servidor, así el token no queda en logs)
    if (process.env.CLIENT_URL) {
      return res.redirect(`${process.env.CLIENT_URL}/api-docs#token=${token}`);
    }

    // 3. Fallback JSON si no hay CLIENT_URL
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        provider: req.user.provider,
      },
    });
  }
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
});

module.exports = router;