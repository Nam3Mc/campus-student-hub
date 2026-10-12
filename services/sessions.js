const Session = require('../models/Session');
const StudyGroup = require('../models/StudyGroup');
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../utils/errors');

// ---------- Helpers ----------

async function loadGroupOrThrow(groupId) {
  const group = await StudyGroup.findById(groupId);
  if (!group) throw new NotFoundError('Study group not found');
  return group;
}

function isMember(group, userId) {
  return (
    group.ownerId.toString() === userId.toString() ||
    group.members.some((m) => m.toString() === userId.toString())
  );
}

function isOwner(group, userId) {
  return group.ownerId.toString() === userId.toString();
}

// ---------- Read ----------

// GET all sessions
exports.getSessions = async () => {
  return Session.find()
    .sort({ date: 1 })
    .populate('groupId', 'name course')
    .populate('attendees', 'firstName lastName email');
};

// GET single session
exports.getSessionById = async (id) => {
  const session = await Session.findById(id)
    .populate('groupId', 'name course')
    .populate('attendees', 'firstName lastName email');

  if (!session) throw new NotFoundError('Session not found');
  return session;
};

// GET sessions by group
exports.getSessionsByGroup = async (groupId) => {
  await loadGroupOrThrow(groupId);

  return Session.find({ groupId })
    .sort({ date: 1 })
    .populate('attendees', 'firstName lastName email');
};

// ---------- Create ----------

// POST create a session
exports.createSession = async (data, userId) => {
  const { groupId, date, location, topic, description } = data;

  if (!groupId || !date || !location || !topic) {
    throw new BadRequestError('groupId, date, location, and topic are required');
  }

  const when = new Date(date);
  if (Number.isNaN(when.getTime())) {
    throw new BadRequestError('Invalid date format');
  }

  const group = await loadGroupOrThrow(groupId);

  // Only members of the group can schedule sessions
  if (!isMember(group, userId)) {
    throw new ForbiddenError('You must be a member of the group to schedule sessions');
  }

  const session = await Session.create({
    groupId,
    date: when,
    location,
    topic,
    description,
    attendees: [userId], // creator auto-attends
  });

  return session.populate([
    { path: 'groupId', select: 'name course' },
    { path: 'attendees', select: 'firstName lastName email' },
  ]);
};

// ---------- Update ----------

// PUT update a session
exports.updateSession = async (id, data, userId) => {
  const session = await Session.findById(id);
  if (!session) throw new NotFoundError('Session not found');

  const group = await loadGroupOrThrow(session.groupId);

  // Only the group owner OR the session creator (auto-attendee[0]) can edit
  const creatorId = session.attendees[0];
  const canEdit =
    isOwner(group, userId) ||
    (creatorId && creatorId.toString() === userId.toString());

  if (!canEdit) {
    throw new ForbiddenError('You are not allowed to update this session');
  }

  const allowed = ['date', 'location', 'topic', 'description'];
  for (const key of allowed) {
    if (data[key] !== undefined) session[key] = data[key];
  }

  if (session.date) {
    const when = new Date(session.date);
    if (Number.isNaN(when.getTime())) {
      throw new BadRequestError('Invalid date format');
    }
    session.date = when;
  }

  await session.save();
  return session;
};

// ---------- Delete ----------

// DELETE a session
exports.deleteSession = async (id, userId) => {
  const session = await Session.findById(id);
  if (!session) throw new NotFoundError('Session not found');

  const group = await loadGroupOrThrow(session.groupId);

  const creatorId = session.attendees[0];
  const canDelete =
    isOwner(group, userId) ||
    (creatorId && creatorId.toString() === userId.toString());

  if (!canDelete) {
    throw new ForbiddenError('You are not allowed to delete this session');
  }

  await session.deleteOne();
  return session;
};

// ---------- Extra: RSVP (optional, matches attendees field) ----------

// POST /sessions/:id/join — add current user to attendees
exports.joinSession = async (id, userId) => {
  const session = await Session.findById(id);
  if (!session) throw new NotFoundError('Session not found');

  const group = await loadGroupOrThrow(session.groupId);
  if (!isMember(group, userId)) {
    throw new ForbiddenError('You must be a member of the group to attend sessions');
  }

  const already = session.attendees.some((a) => a.toString() === userId.toString());
  if (already) throw new BadRequestError('You are already an attendee');

  session.attendees.push(userId);
  await session.save();

  return session.populate('attendees', 'firstName lastName email');
};

// POST /sessions/:id/leave — remove current user from attendees
exports.leaveSession = async (id, userId) => {
  const session = await Session.findById(id);
  if (!session) throw new NotFoundError('Session not found');

  const before = session.attendees.length;
  session.attendees = session.attendees.filter(
    (a) => a.toString() !== userId.toString()
  );

  if (session.attendees.length === before) {
    throw new BadRequestError('You are not an attendee of this session');
  }

  await session.save();
  return session.populate('attendees', 'firstName lastName email');
};