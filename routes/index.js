const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger/swagger.json');

// Swagger Route
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

router.get('/', (req, res) => {
    res.send('Campus Study Hub API is running');
});

// Mounting route modules
router.use('/auth', require('./auth'))
router.use('/users', require('./users'));
router.use('/groups', require('./groups'));
router.use('/sessions', require('./sessions'))
router.use('/resources', require('./resources'))

module.exports = router;