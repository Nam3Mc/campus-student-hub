const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const passport = require('passport');

const connectDB = require('./config/db.js');
const errorHandler = require('./middleware/errorHandler');
const swaggerDocument = require('./swagger/swagger.json');

dotenv.config();

// Skip real DB connect during tests (mongodb-memory-server handles it)
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

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

// ----- Session config -----
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'change-me-in-prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
};

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

// ----- Swagger (CDN-based, works on Vercel) -----

// 1) Expose the OpenAPI JSON
app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
});

// 2) Serve the Swagger UI HTML that loads assets from a CDN
//    Auto-authorizes from #token=... if redirected back from Google OAuth.
app.get('/api-docs', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Campus Study Hub API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function () {
      // Read #token=... from the URL hash (set by /auth/google/callback)
      const hash = window.location.hash || '';
      const match = hash.match(/token=([^&]+)/);
      const token = match ? decodeURIComponent(match[1]) : null;

      const ui = SwaggerUIBundle({
        url: '/docs.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: 'StandaloneLayout',
        onComplete: function () {
          if (token) {
            // Auto-populate the "Authorize" dialog with the JWT
            ui.preauthorizeApiKey('bearerAuth', token);
            // Strip the hash so the token doesn't linger in the address bar
            history.replaceState(null, '', window.location.pathname);
          }
        }
      });
      window.ui = ui;
    };
  </script>
</body>
</html>`);
});

// ----- Main routes -----
app.use('/', require('./routes/index.js'));

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8080;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;