const mongoose = require('mongoose');
const Session = require('../../models/Session');

describe('Session model', () => {
  it('creates and reads a session', async () => {
    const groupId = new mongoose.Types.ObjectId();
    const created = await Session.create({
      location: 'Library',
      topic: 'Recursion',
      description: 'Deep dive',
      groupId,
    });
    const found = await Session.findById(created._id);
    expect(found).toBeTruthy();
    expect(found.topic).toBe('Recursion');
  });

  it('requires location, topic, description', async () => {
    await expect(Session.create({})).rejects.toThrow();
  });

  it('toJSON strips __v', async () => {
    const groupId = new mongoose.Types.ObjectId();
    const s = await Session.create({
      location: 'L', topic: 'T', description: 'D', groupId,
    });
    expect(s.toJSON().__v).toBeUndefined();
  });
});