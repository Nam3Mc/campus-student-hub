const studyGroupService = require('../services/group');

exports.getAllGroups = async (req, res, next) => {
  try {
    const groups = await studyGroupService.getAllGroups();
    res.status(200).json(groups);
  } catch (err) {
    next(err);
  }
};

exports.getGroupById = async (req, res, next) => {
  try {
    const group = await studyGroupService.getGroupById(req.params.id);
    res.status(200).json(group);
  } catch (err) {
    next(err);
  }
};

exports.createGroup = async (req, res, next) => {
  try {
    const group = await studyGroupService.createGroup(
      req.body,
      req.user && req.user.id
    );
    res.status(201).json(group);
  } catch (err) {
    next(err);
  }
};

exports.updateGroup = async (req, res, next) => {
  try {
    await studyGroupService.updateGroup(
      req.params.id,
      req.body,
      req.user && req.user.id
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.deleteGroup = async (req, res, next) => {
  try {
    await studyGroupService.deleteGroup(
      req.params.id,
      req.user && req.user.id
    );
    res.status(200).json({ message: 'Study group deleted successfully' });
  } catch (err) {
    next(err);
  }
};