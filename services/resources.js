const Resource = require('../models/Resource');

// GET all Resources
exports.getResources = async () => {
    const resources = await Resource.find()
    return resources
}
// GET single resource by id

exports.getResourceById = async (id) => {
  const resource = await Resource.findById(id);
  if (!resource) {
    throw new NotFoundError('Resource not found');
  }
  return resource;
};

// GET resources by group
exports.getResourcesByGroup = async (groupId) => {
  const group = await StudyGroup.findById(groupId);
  if (!group) {
    throw new NotFoundError('Study group not found');
  }
  return Resource.find({ groupId }).sort({ createdAt: -1 });
};

// POST create a new resource
exports.createResource = async (data, userId) => {
  const { title, url, type, description, groupId } = data;

  // Business rules
  if (!title || !url || !type || !groupId) {
    throw new BadRequestError('title, url, type, and groupId are required');
  }

  if (!['pdf', 'video', 'link'].includes(type)) {
    throw new BadRequestError('type must be one of: pdf, video, link');
  }

  const group = await StudyGroup.findById(groupId);
  if (!group) {
    throw new NotFoundError('Study group not found');
  }

  const isMember =
    group.ownerId.toString() === userId.toString() ||
    group.members.some((m) => m.toString() === userId.toString());

  if (!isMember) {
    throw new ForbiddenError('You must be a member of the group to add resources');
  }

  const resource = await Resource.create({
    title,
    url,
    type,
    description,
    groupId,
    uploadedBy: userId,
  });

  return resource;
};

// PUT update a resource
exports.updateResource = async (id, data, userId) => {
  const resource = await Resource.findById(id);
  if (!resource) {
    throw new NotFoundError('Resource not found');
  }

  if (resource.uploadedBy.toString() !== userId.toString()) {
    throw new ForbiddenError('You can only update resources you uploaded');
  }

  const allowed = ['title', 'url', 'type', 'description'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      resource[key] = data[key];
    }
  }

  if (resource.type && !['pdf', 'video', 'link'].includes(resource.type)) {
    throw new BadRequestError('type must be one of: pdf, video, link');
  }

  await resource.save();
  return resource;
};

// DELETE a resource
exports.deleteResource = async (id, userId) => {
  const resource = await Resource.findById(id);
  if (!resource) {
    throw new NotFoundError('Resource not found');
  }

  if (resource.uploadedBy.toString() !== userId.toString()) {
    throw new ForbiddenError('You can only delete resources you uploaded');
  }

  await resource.deleteOne();
  return resource;
};