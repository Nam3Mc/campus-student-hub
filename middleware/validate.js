// middleware/validate.js
const { BadRequestError } = require('../utils/errors');

const isNonEmptyString = (v) =>
  typeof v === 'string' && v.trim().length > 0;

const isEmail = (v) =>
  typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const isUrl = (v) => {
  if (typeof v !== 'string') return false;
  try { new URL(v); return true; } catch { return false; }
};

const isObjectId = (v) =>
  typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);

const isISODate = (v) =>
  typeof v === 'string' && !Number.isNaN(Date.parse(v));

// ---------- Users ----------
exports.validateUserCreate = (req, res, next) => {
  const { firstName, lastName, email, password, major, role } = req.body || {};

  if (!isNonEmptyString(firstName)) return next(new BadRequestError('firstName is required'));
  if (!isNonEmptyString(lastName))  return next(new BadRequestError('lastName is required'));
  if (!isEmail(email))              return next(new BadRequestError('A valid email is required'));
  if (!isNonEmptyString(password) || password.length < 6)
    return next(new BadRequestError('password must be at least 6 characters'));
  if (!isNonEmptyString(major))     return next(new BadRequestError('major is required'));
  if (role && !['student', 'tutor', 'admin'].includes(role))
    return next(new BadRequestError('role must be student, tutor, or admin'));

  next();
};

exports.validateUserUpdate = (req, res, next) => {
  const b = req.body || {};
  if (b.firstName !== undefined && !isNonEmptyString(b.firstName))
    return next(new BadRequestError('firstName cannot be empty'));
  if (b.lastName !== undefined && !isNonEmptyString(b.lastName))
    return next(new BadRequestError('lastName cannot be empty'));
  if (b.email !== undefined && !isEmail(b.email))
    return next(new BadRequestError('A valid email is required'));
  if (b.password !== undefined && (typeof b.password !== 'string' || b.password.length < 6))
    return next(new BadRequestError('password must be at least 6 characters'));
  if (b.role !== undefined && !['student', 'tutor', 'admin'].includes(b.role))
    return next(new BadRequestError('role must be student, tutor, or admin'));
  next();
};

// ---------- Study Groups ----------
exports.validateGroupCreate = (req, res, next) => {
  const { name, course, description, ownerId, members } = req.body || {};

  if (!isNonEmptyString(name))        return next(new BadRequestError('name is required'));
  if (!isNonEmptyString(course))      return next(new BadRequestError('course is required'));
  if (!isNonEmptyString(description)) return next(new BadRequestError('description is required'));
  if (!isObjectId(ownerId))           return next(new BadRequestError('ownerId must be a valid ObjectId'));
  if (members !== undefined && !Array.isArray(members))
    return next(new BadRequestError('members must be an array'));

  next();
};

exports.validateGroupUpdate = (req, res, next) => {
  const b = req.body || {};
  if (b.name !== undefined && !isNonEmptyString(b.name))
    return next(new BadRequestError('name cannot be empty'));
  if (b.course !== undefined && !isNonEmptyString(b.course))
    return next(new BadRequestError('course cannot be empty'));
  if (b.description !== undefined && !isNonEmptyString(b.description))
    return next(new BadRequestError('description cannot be empty'));
  if (b.members !== undefined && !Array.isArray(b.members))
    return next(new BadRequestError('members must be an array'));
  next();
};

// ---------- Sessions ----------
exports.validateSessionCreate = (req, res, next) => {
  const { groupId, date, location, topic, attendees } = req.body || {};

  if (!isObjectId(groupId))       return next(new BadRequestError('groupId must be a valid ObjectId'));
  if (!isISODate(date))           return next(new BadRequestError('date must be a valid ISO date'));
  if (!isNonEmptyString(location))return next(new BadRequestError('location is required'));
  if (!isNonEmptyString(topic))   return next(new BadRequestError('topic is required'));
  if (attendees !== undefined && !Array.isArray(attendees))
    return next(new BadRequestError('attendees must be an array'));

  next();
};

exports.validateSessionUpdate = (req, res, next) => {
  const b = req.body || {};
  if (b.date !== undefined && !isISODate(b.date))
    return next(new BadRequestError('date must be a valid ISO date'));
  if (b.location !== undefined && !isNonEmptyString(b.location))
    return next(new BadRequestError('location cannot be empty'));
  if (b.topic !== undefined && !isNonEmptyString(b.topic))
    return next(new BadRequestError('topic cannot be empty'));
  if (b.attendees !== undefined && !Array.isArray(b.attendees))
    return next(new BadRequestError('attendees must be an array'));
  next();
};

// ---------- Resources ----------
exports.validateResourceCreate = (req, res, next) => {
  const { title, url, type, groupId } = req.body || {};

  if (!isNonEmptyString(title)) return next(new BadRequestError('title is required'));
  if (!isUrl(url))              return next(new BadRequestError('url must be a valid URL'));
  if (!['pdf', 'video', 'link'].includes(type))
    return next(new BadRequestError('type must be pdf, video, or link'));
  if (!isObjectId(groupId))     return next(new BadRequestError('groupId must be a valid ObjectId'));

  next();
};

exports.validateResourceUpdate = (req, res, next) => {
  const b = req.body || {};
  if (b.title !== undefined && !isNonEmptyString(b.title))
    return next(new BadRequestError('title cannot be empty'));
  if (b.url !== undefined && !isUrl(b.url))
    return next(new BadRequestError('url must be a valid URL'));
  if (b.type !== undefined && !['pdf', 'video', 'link'].includes(b.type))
    return next(new BadRequestError('type must be pdf, video, or link'));
  next();
};