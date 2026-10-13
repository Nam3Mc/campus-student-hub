const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Session = require('../../models/Session');
const { extractArray, extractDoc } = require('../helpers/response');

describe('Sessions routes', () => {
  const groupId = new mongoose.Types.ObjectId();

  describe('GET /sessions', () => {
    it('returns 200 and all sessions', async () => {
      await Session.create([
        { location: 'L1', topic: 'T1', description: 'd1', groupId },
        { location: 'L2', topic: 'T2', description: 'd2', groupId },
      ]);
      const res = await request(app).get('/sessions');
      expect(res.status).toBe(200);
      const arr = extractArray(res.body);
      expect(arr).not.toBeNull();
      expect(arr.length).toBe(2);
    });

    it('returns 200 with an empty array when none exist', async () => {
      const res = await request(app).get('/sessions');
      expect(res.status).toBe(200);
      expect(extractArray(res.body)).toEqual([]);
    });
  });

  describe('GET /sessions/:id', () => {
    it('returns 200 and the matching session', async () => {
      const session = await Session.create({
        location: 'Lib', topic: 'X', description: 'd', groupId,
      });
      const res = await request(app).get(`/sessions/${session._id}`);
      expect(res.status).toBe(200);
      const doc = extractDoc(res.body);
      expect(String(doc._id)).toBe(String(session._id));
    });

    it('returns 404 for a non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/sessions/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /sessions/group/:groupId', () => {
    it('returns 200 and sessions for the group', async () => {
      const StudyGroup = require('../../models/StudyGroup');
      const group = await StudyGroup.create({
        name: 'G', course: 'CS', description: 'd',
        ownerId: new mongoose.Types.ObjectId(),
      });

      await Session.create([
        { location: 'L', topic: 'T', description: 'd', groupId: group._id },
      ]);

      const res = await request(app).get(`/sessions/group/${group._id}`);
      expect(res.status).toBe(200);
      const arr = extractArray(res.body);
      expect(arr).not.toBeNull();
      expect(arr.length).toBe(1);
    });
  });
  
})