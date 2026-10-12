const resourceService = require('../services/resources')

exports.allResources = async (req, res, next) => {
    try {
        const  resources = await resourceService.getResources()
        res.status(200).json(resources)
    } catch (error) {
        res.status(500).json({ message: 'Resources controller Error', error: error.message })
    }
}

exports.getResourceById = async (req, res, next) => {
  try {
    const resource = await resourceService.getResourceById(req.params.id);
    res.status(200).json(resource);
  } catch (err) {
    next(err);
  }
};

exports.getResourcesByGroup = async (req, res, next) => {
  try {
    const resources = await resourceService.getResourcesByGroup(req.params.groupId);
    res.status(200).json(resources);
  } catch (err) {
    next(err);
  }
};

exports.createResource = async (req, res, next) => {
  try {
    const resource = await resourceService.createResource(req.body, req.user.id);
    res.status(201).json(resource);
  } catch (err) {
    next(err);
  }
};

exports.updateResource = async (req, res, next) => {
  try {
    await resourceService.updateResource(req.params.id, req.body, req.user.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.deleteResource = async (req, res, next) => {
  try {
    await resourceService.deleteResource(req.params.id, req.user.id);
    res.status(200).json({ message: 'Resource deleted successfully' });
  } catch (err) {
    next(err);
  }
};