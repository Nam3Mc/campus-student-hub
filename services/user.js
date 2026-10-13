const User = require('../models/User');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.status = 400;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

const VALID_ROLES = ['student', 'instructor', 'admin'];

// GET all users
exports.getAllUsers = async () => {
  return User.find();
};

// GET single user
exports.getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

// POST create user
exports.createUser = async (data) => {
  const { firstName, lastName, email, password, role, major, googleId, provider } = data;

  // Business rule: required fields (password is optional if logging in via OAuth)
  if (!firstName || !lastName || !email || (!password && !googleId) || !major) {
    throw new BadRequestError(
      'firstName, lastName, email, password (or googleId), and major are required'
    );
  }

  // Business rule: role validation
  if (role && !VALID_ROLES.includes(role)) {
    throw new BadRequestError(
      `role must be one of: ${VALID_ROLES.join(', ')}`
    );
  }

  // Business rule: unique email
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ConflictError('A user with this email already exists');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'student',
    major,
    googleId,
    provider: provider || 'local',
  });

  return user;
};

// PUT update user
exports.updateUser = async (id, data) => {
  const user = await User.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Business rule: don't allow email change to an existing one
  if (data.email && data.email.toLowerCase() !== user.email.toLowerCase()) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }
  }

  // Business rule: role validation
  if (data.role && !VALID_ROLES.includes(data.role)) {
    throw new BadRequestError(
      `role must be one of: ${VALID_ROLES.join(', ')}`
    );
  }

  // Whitelist of updatable fields (including OAuth fields)
  const allowed = ['firstName', 'lastName', 'email', 'password', 'role', 'major', 'googleId', 'provider'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      user[key] = data[key];
    }
  }

  await user.save();
  return user;
};

// DELETE user
exports.deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};