const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase().trim();
        let user = await User.findOne({ googleId: profile.id });

        // Link Google account to an existing local user by email
        if (!user && email) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            user.provider = 'google';
            await user.save();
          }
        }

        // Create a new user from the Google profile
        if (!user) {
          // Split displayName into first/last name for the target schema
          const nameParts = (profile.displayName || 'Google User').split(' ');
          const firstName = nameParts[0] || 'Google';
          const lastName = nameParts.slice(1).join(' ') || 'User';

          user = await User.create({
            googleId: profile.id,
            email,
            firstName,
            lastName,
            // These fields are required by the target schema —
            // set sensible defaults or prompt the user to complete them later
            major: 'Undeclared',
            role: 'student',
            provider: 'google',
            password: null, // OAuth users have no local password
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;