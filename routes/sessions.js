const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessions');
const { auth } = require('../middleware/auth');

// Public reads
router.get('/', sessionController.getSessions);

// IMPORTANT: static segments before /:id
router.get('/group/:groupId', sessionController.getSessionsByGroup);
router.get('/:id', sessionController.getSessionById);

// Protected writes
router.post('/', auth, sessionController.createSession);
router.put('/:id', auth, sessionController.updateSession);
router.delete('/:id', auth, sessionController.deleteSession);

// RSVP
router.post('/:id/join', auth, sessionController.joinSession);
router.post('/:id/leave', auth, sessionController.leaveSession);

module.exports = router;