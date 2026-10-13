const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { auth } = require('../middleware/auth');
const validation = require('../middleware/validate');

router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);

router.post(
  '/',
  auth,
  validation.validateUserCreate,
  usersController.createUser
);

router.put(
  '/:id',
  auth,
  validation.validateUserUpdate,
  usersController.updateUser
);

router.delete('/:id', auth, usersController.deleteUser);

module.exports = router;