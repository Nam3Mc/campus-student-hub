require('dotenv').config();  

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db.js');
const errorHandler = require('./middleware/errorHandler');
const passport = require('./config/passport');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes/index.js'));
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});