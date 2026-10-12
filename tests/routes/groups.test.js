const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const StudyGroup = require('../../models/StudyGroup');
const { extractArray, extractDoc } = require('../helpers/response');

describe('Groups routes', () => {
  const ownerId = new mongoose.Types.ObjectId();

  describe('GET /groups', () => {
    it('returns 200 and all groups', async () => {
      await StudyGroup.create([
        { name: 'A', course: 'CS1', description: 'd1', ownerId },
        { name: 'B', course: 'CS2', description: 'd2', ownerId },
      ]);
      const res = await request(app).get('/groups');
      expect(res.status).toBe(200);
      const arr = extractArray(res.body);
      expect(arr).not.toBeNull();
      expect(arr.length).toBe(2);
    });

    it('returns 200 with an empty array when none exist', async () => {
      const res = await request(app).get('/groups');
      expect(res.status).toBe(200);
      expect(extractArray(res.body)).toEqual([]);
    });
  });

  describe('GET /groups/:id', () => {
    it('returns 200 and the matching group', async () => {
      const group = await StudyGroup.create({
        name: 'Test', course: 'CS101', description: 'd', ownerId,
      });
      const res = await request(app).get(`/groups/${group._id}`);
      expect(res.status).toBe(200);
      const doc = extractDoc(res.body);
      expect(String(doc._id)).toBe(String(group._id));
    });

    it('returns 404 for a non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/groups/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });
});