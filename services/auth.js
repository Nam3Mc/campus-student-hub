const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Register
exports.register = async (data) => {
  const { firstName, lastName, email, password, role, major } = data;

  if (!firstName || !lastName || !email || !password || !major) {
    throw new BadRequestError('firstName, lastName, email, password, and major are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ConflictError('Email is already registered');
  }

  // Never let public registration create admins
  const safeRole = role === 'admin' ? 'student' : role || 'student';

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: safeRole,
    major,
  });

  const token = signToken(user);
  return { token, user };
};

// Login
exports.login = async ({ email, password }) => {
  if (!email || !password) {
    throw new BadRequestError('Email and password are required');
  }

  // Explicitly select password (it's select:false on the schema)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = signToken(user);
  // Remove password before returning
  user.password = undefined;
  return { token, user };
};

// Status (current user)
exports.getStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

exports.signToken = signToken;