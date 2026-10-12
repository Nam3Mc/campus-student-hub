const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const passport = require('passport');

const connectDB = require('./config/db.js');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// Connect to MongoDB
connectDB();

// Register the Google strategy after loading environment variables
require('./config/passport');

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for Passport's session-based OAuth flow
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'change-me-in-prod',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: 'sessions',
            ttl: 60 * 60 * 24, // 1 day
        }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite:
                process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Main routes
app.use('/', require('./routes/index.js'));

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});