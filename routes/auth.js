const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/auth');
const { auth } = require('../middleware/auth');

// Local auth
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/status', auth, authController.status);
router.get('/logout', auth, authController.logout);

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
    session: true, // keep session for OAuth flow
  }),
  (req, res) => {
    // Option A: redirect to a frontend URL (if CLIENT_URL is set)
    if (process.env.CLIENT_URL) {
      return res.redirect(`${process.env.CLIENT_URL}/api-docs`);
    }
    // Option B: return JSON (for API-only clients)
    return res.json({
      message: 'Login successful',
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