const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessions');
const { auth } = require('../middleware/auth');
const validation = require('../middleware/validate');

router.get('/', sessionController.getSessions);
router.get('/group/:groupId', sessionController.getSessionsByGroup);
router.get('/:id', sessionController.getSessionById);

router.post(
  '/',
  auth,
  validation.validateSessionCreate,
  sessionController.createSession
);

router.put(
  '/:id',
  auth,
  validation.validateSessionUpdate,
  sessionController.updateSession
);

router.delete('/:id', auth, sessionController.deleteSession);

router.post('/:id/join', auth, sessionController.joinSession);
router.post('/:id/leave', auth, sessionController.leaveSession);

module.exports = router;