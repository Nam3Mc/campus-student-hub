const express = require('express');
const passport = require('passport');
const router = express.Router();
const { signToken } = require('../services/auth');

// STEP 1 — kick off the flow: redirect user to Google
// User visits http://localhost:8080/auth/google in the browser
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

// STEP 2 — Google redirects back here after the user consents
// We issue OUR OWN JWT (same token shape as email/password login)
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/google/failure',
  }),
  (req, res) => {
    // req.user is the Mongo user that the Passport verify callback returned
    const token = signToken(req.user);

    // For now, just return JSON so we can test with a browser.
    // Later you can redirect to your frontend, e.g.:
    //   res.redirect(`http://localhost:5173/oauth?token=${token}`);
    res.json({
      message: 'Google login successful',
      token,
      user: req.user,
    });
  }
);

// STEP 3 — Simple failure endpoint so failureRedirect has somewhere to go
router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
});

module.exports = router;