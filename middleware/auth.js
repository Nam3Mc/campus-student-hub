// const jwt = require('jsonwebtoken');
// const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

// const JWT_SECRET = process.env.JWT_SECRET;

// function extractToken(req) {
//     const header = req.headers.authorization;

//     if (!header) return null;

//     const [scheme, token] = header.split(' ');

//     if (scheme !== 'Bearer' || !token) return null;

//     return token;
// }

// function auth(req, res, next) {
//     // First, accept an authenticated Passport session.
//     if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
//         return next();
//     }

//     // Otherwise, try the existing JWT authentication.
//     try {
//         const token = extractToken(req);

//         if (!token) {
//             throw new UnauthorizedError('Please log in first.');
//         }

//         const payload = jwt.verify(token, JWT_SECRET);

//         req.user = {
//             id: payload.id,
//             role: payload.role,
//         };

//         return next();
//     } catch (err) {
//         if (
//             err.name === 'TokenExpiredError' ||
//             err.name === 'JsonWebTokenError'
//         ) {
//             return next(
//                 new UnauthorizedError(
//                     err.name === 'TokenExpiredError'
//                         ? 'Token expired'
//                         : 'Invalid token'
//                 )
//             );
//         }

//         return next(err);
//     }
// }

// // Role guard — usage: requireRole('admin')
// function requireRole(...roles) {
//     return (req, res, next) => {
//         if (!req.user) {
//             return next(new UnauthorizedError('Not authenticated'));
//         }

//         if (!roles.includes(req.user.role)) {
//             return next(new ForbiddenError('Insufficient permissions'));
//         }

//         next();
//     };
// }

// module.exports = { auth, requireRole };


const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const authService = require('../services/auth');

const JWT_SECRET = process.env.JWT_SECRET;

function extractToken(req) {
    const header = req.headers.authorization;
    if (!header) return null;

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return null;

    return token;
}

async function auth(req, res, next) {
    // 1. Passport session?
    if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
        return next();
    }

    // 2. JWT
    try {
        const token = extractToken(req);

        if (!token) {
            throw new UnauthorizedError('Please log in first.');
        }

        // Reject tokens that have been logged out
        if (await authService.isTokenBlacklisted(token)) {
            throw new UnauthorizedError('Token has been revoked');
        }

        const payload = jwt.verify(token, JWT_SECRET);

        req.user = {
            id: payload.id,
            role: payload.role,
        };

        return next();
    } catch (err) {
        if (
            err.name === 'TokenExpiredError' ||
            err.name === 'JsonWebTokenError'
        ) {
            return next(
                new UnauthorizedError(
                    err.name === 'TokenExpiredError'
                        ? 'Token expired'
                        : 'Invalid token'
                )
            );
        }

        return next(err);
    }
}

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