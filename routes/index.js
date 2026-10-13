const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Campus Study Hub API is running');
});

// Mounting route modules
router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/groups', require('./groups'));
router.use('/sessions', require('./sessions'));
router.use('/resources', require('./resources'));

module.exports = router;