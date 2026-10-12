// controllers/sessionController.js
const sessionService = require('../services/sessions');

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await sessionService.getSessions();
    res.status(200).json(sessions);
  } catch (err) {
    next(err);
  }
};

exports.getSessionById = async (req, res, next) => {
  try {
    const session = await sessionService.getSessionById(req.params.id);
    res.status(200).json(session);
  } catch (err) {
    next(err);
  }
};

exports.getSessionsByGroup = async (req, res, next) => {
  try {
    const sessions = await sessionService.getSessionsByGroup(req.params.groupId);
    res.status(200).json(sessions);
  } catch (err) {
    next(err);
  }
};

exports.createSession = async (req, res, next) => {
  try {
    const session = await sessionService.createSession(req.body, req.user.id);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    await sessionService.updateSession(req.params.id, req.body, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.deleteSession = async (req, res, next) => {
  try {
    await sessionService.deleteSession(req.params.id, req.user.id);
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.joinSession = async (req, res, next) => {
  try {
    const session = await sessionService.joinSession(req.params.id, req.user.id);
    res.status(200).json(session);
  } catch (err) {
    next(err);
  }
};

exports.leaveSession = async (req, res, next) => {
  try {
    const session = await sessionService.leaveSession(req.params.id, req.user.id);
    res.status(200).json(session);
  } catch (err) {
    next(err);
  }
};