const express = require('express');
const router = express.Router();
const resourcesControler = require('../controllers/resources');
const { auth } = require('../middleware/auth');


router.get('/', resourcesControler.allResources)
router.get('/:id', resourcesControler.getResourceById);
router.get('/group/:groupId', resourcesControler.getResourcesByGroup);

router.post('/', auth, resourcesControler.createResource);
router.put('/:id', auth, resourcesControler.updateResource);
router.delete('/:id', auth, resourcesControler.deleteResource);

module.exports = router