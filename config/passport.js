const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User'); // Required for googleId querying
const userService = require('../services/user');

passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    // Using userService function instead of userS typo
    const user = await userService.getUserById(id);
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
        
        // Find user by Google ID
        let user = await User.findOne({ googleId: profile.id });

        // Link Google account to an existing local user by email if not found by googleId
        if (!user && email) {
          user = await User.findOne({ email });
          if (user) {
            // Using userService.updateUser to safely apply updates with validation
            user = await userService.updateUser(user._id, {
              googleId: profile.id,
              provider: 'google',
            });
          }
        }

        // Create a new user from the Google profile using userService.createUser
        if (!user) {
          const nameParts = (profile.displayName || 'Google User').split(' ');
          const firstName = nameParts[0] || 'Google';
          const lastName = nameParts.slice(1).join(' ') || 'User';

          user = await userService.createUser({
            googleId: profile.id,
            email,
            firstName,
            lastName,
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