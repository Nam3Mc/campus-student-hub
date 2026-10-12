const StudyGroup = require('../models/StudyGroup');

// GET all study groups
exports.getAllGroups = async (req, res) => {
    try {
        const groups = await StudyGroup.find().populate('ownerId', 'firstName lastName email');
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving groups', error: error.message });
    }
};

// GET single study group
exports.getGroupById = async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id).populate('ownerId', 'firstName lastName email');
        if (!group) {
            return res.status(404).json({ message: 'Study group not found' });
        }
        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ message: 'Invalid Group ID or server error', error: error.message });
    }
};

// POST create study group
exports.createGroup = async (req, res) => {
    try {
        const { name, course, description, ownerId, members } = req.body;
        if (!name || !course || !description || !ownerId) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const newGroup = new StudyGroup({ name, course, description, ownerId, members });
        const savedGroup = await newGroup.save();
        res.status(201).json(savedGroup);
    } catch (error) {
        res.status(400).json({ message: 'Error creating study group', error: error.message });
    }
};

// PUT update study group
exports.updateGroup = async (req, res) => {
    try {
        const updatedGroup = await StudyGroup.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: 'Error updating study group', error: error.message });
    }
};

// DELETE study group
exports.deleteGroup = async (req, res) => {
    try {
        const deletedGroup = await StudyGroup.findByIdAndDelete(req.params.id);
        if (!deletedGroup) {
            return res.status(404).json({ message: 'Study group not found' });
        }
        res.status(200).json({ message: 'Study group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting study group', error: error.message });
    }
};