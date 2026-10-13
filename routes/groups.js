const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groups');
const { auth } = require('../middleware/auth');
const validation = require('../middleware/validate');

router.get('/', groupsController.getAllGroups);
router.get('/:id', groupsController.getGroupById);

router.post(
  '/',
  auth,
  validation.validateGroupCreate,
  groupsController.createGroup
);

router.put(
  '/:id',
  auth,
  validation.validateGroupUpdate,
  groupsController.updateGroup
);

router.delete('/:id', auth, groupsController.deleteGroup);

// ---------- Membership ----------

router.post('/:id/join', auth, groupsController.joinGroup);
router.post('/:id/leave', auth, groupsController.leaveGroup);

module.exports = router;