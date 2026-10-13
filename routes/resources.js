const express = require('express');
const router = express.Router();
const resourcesController = require('../controllers/resources');
const { auth } = require('../middleware/auth');
const validation = require('../middleware/validate');

router.get('/', resourcesController.allResources);
router.get('/group/:groupId', resourcesController.getResourcesByGroup);
router.get('/:id', resourcesController.getResourceById);

router.post(
  '/',
  auth,
  validation.validateResourceCreate,
  resourcesController.createResource
);

router.put(
  '/:id',
  auth,
  validation.validateResourceUpdate,
  resourcesController.updateResource
);

router.delete('/:id', auth, resourcesController.deleteResource);

module.exports = router;