const authService = require('../services/auth');

exports.register = async (req, res, next) => {
  try {
    const { token, user } = await authService.register(req.body);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { token, user } = await authService.login(req.body);
    res.status(200).json({ token, user });
  } catch (err) {
    next(err);
  }
};

exports.status = async (req, res, next) => {
  try {
    const user = await authService.getStatus(req.user.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  res.status(200).json({ message: 'Logged out successfully' });
};