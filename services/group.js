const StudyGroup = require('../models/StudyGroup');
const User = require('../models/User');
const {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} = require('../utils/errors');

const OWNER_POPULATE = { path: 'ownerId', select: 'firstName lastName email' };
const MEMBERS_POPULATE = { path: 'members', select: 'firstName lastName email' };

// GET all study groups
exports.getAllGroups = async () => {
  return StudyGroup.find()
    .populate(OWNER_POPULATE)
    .populate(MEMBERS_POPULATE);
};

// GET single study group
exports.getGroupById = async (id) => {
  const group = await StudyGroup.findById(id)
    .populate(OWNER_POPULATE)
    .populate(MEMBERS_POPULATE);

  if (!group) {
    throw new NotFoundError('Study group not found');
  }
  return group;
};

// POST create study group
exports.createGroup = async (data, userId) => {
  const { name, course, description, ownerId, members } = data;

  if (!name || !course || !description || !ownerId) {
    throw new BadRequestError(
      'name, course, description, and ownerId are required'
    );
  }

  // Business rule: owner must exist
  const owner = await User.findById(ownerId);
  if (!owner) {
    throw new NotFoundError('Owner user not found');
  }

  // Business rule: only you can create a group you own
  if (userId && ownerId.toString() !== userId.toString()) {
    throw new ForbiddenError('You can only create groups you own');
  }

  // Business rule: owner is always a member (deduped)
  const memberSet = new Set((members || []).map((m) => m.toString()));
  memberSet.add(ownerId.toString());

  const group = await StudyGroup.create({
    name,
    course,
    description,
    ownerId,
    members: [...memberSet],
  });

  return group.populate([OWNER_POPULATE, MEMBERS_POPULATE]);
};

// GET group members 

// PUT update study group
exports.updateGroup = async (id, data, userId) => {
  const group = await StudyGroup.findById(id);
  if (!group) {
    throw new NotFoundError('Study group not found');
  }

  // Business rule: only the owner can update the group
  if (
    userId &&
    group.ownerId.toString() !== userId.toString()
  ) {
    throw new ForbiddenError('Only the group owner can update this group');
  }

  // Business rule: owner cannot be reassigned via update
  if (data.ownerId !== undefined) {
    throw new BadRequestError('ownerId cannot be changed');
  }

  // Business rule: if members are provided, owner must remain in the list
  if (data.members !== undefined) {
    const memberSet = new Set(data.members.map((m) => m.toString()));
    memberSet.add(group.ownerId.toString());
    group.members = [...memberSet];
  }

  const allowed = ['name', 'course', 'description'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      group[key] = data[key];
    }
  }

  await group.save();
  return group;
};

// DELETE study group
exports.deleteGroup = async (id, userId) => {
  const group = await StudyGroup.findById(id);
  if (!group) {
    throw new NotFoundError('Study group not found');
  }

  // Business rule: only the owner can delete the group
  if (
    userId &&
    group.ownerId.toString() !== userId.toString()
  ) {
    throw new ForbiddenError('Only the group owner can delete this group');
  }

  await group.deleteOne();
  return group;
};

// POST join a study group
exports.joinGroup = async (id, userId) => {
  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const group = await StudyGroup.findById(id);
  if (!group) {
    throw new NotFoundError('Study group not found');
  }

  const userIdStr = userId.toString();
  const alreadyMember = group.members.some(
    (m) => m.toString() === userIdStr
  );

  if (alreadyMember) {
    throw new BadRequestError('You are already a member of this group');
  }

  group.members.push(userId);
  await group.save();

  return group.populate([OWNER_POPULATE, MEMBERS_POPULATE]);
};

// POST leave a study group
exports.leaveGroup = async (id, userId) => {
  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const group = await StudyGroup.findById(id);
  if (!group) {
    throw new NotFoundError('Study group not found');
  }

  const userIdStr = userId.toString();

  // Business rule: the owner cannot leave their own group
  if (group.ownerId.toString() === userIdStr) {
    throw new BadRequestError(
      'The owner cannot leave the group. Transfer ownership or delete the group instead.'
    );
  }

  const before = group.members.length;
  group.members = group.members.filter(
    (m) => m.toString() !== userIdStr
  );

  if (group.members.length === before) {
    throw new BadRequestError('You are not a member of this group');
  }

  await group.save();

  return group.populate([OWNER_POPULATE, MEMBERS_POPULATE]);
};