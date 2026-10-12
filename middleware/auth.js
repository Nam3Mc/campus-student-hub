const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET;

function extractToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function auth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }
    next(err);
  }
}

// Role guard — usage: requireRole('admin')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}

module.exports = { auth, requireRole };