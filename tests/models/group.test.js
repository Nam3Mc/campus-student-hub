const mongoose = require('mongoose');
const StudyGroup = require('../../models/StudyGroup');

describe('StudyGroup model', () => {
  it('creates and reads a group', async () => {
    const ownerId = new mongoose.Types.ObjectId();
    const created = await StudyGroup.create({
      name: 'CS Study',
      course: 'CS101',
      description: 'Weekly meetup',
      ownerId,
    });
    const found = await StudyGroup.findById(created._id);
    expect(found).toBeTruthy();
    expect(found.name).toBe('CS Study');
    expect(String(found.ownerId)).toBe(String(ownerId));
  });

  it('requires name, course, description, ownerId', async () => {
    await expect(StudyGroup.create({})).rejects.toThrow();
  });
});