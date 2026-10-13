const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');
const { extractArray, extractDoc } = require('../helpers/response');

describe('Users routes', () => {
  describe('GET /users', () => {
    it('returns 200 and all users', async () => {
      await User.create([
        { firstName: 'A', lastName: 'One', email: 'a1@x.com', password: 'pw123456', major: 'CS' },
        { firstName: 'B', lastName: 'Two', email: 'b2@x.com', password: 'pw123456', major: 'CS' },
      ]);
      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      const arr = extractArray(res.body);
      expect(arr).not.toBeNull();
      expect(arr.length).toBe(2);
    });

    it('returns 200 with an empty array when none exist', async () => {
      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(extractArray(res.body)).toEqual([]);
    });
  });

  describe('GET /users/:id', () => {
    it('returns 200 and the matching user', async () => {
      const user = await User.create({
        firstName: 'C', lastName: 'Three', email: 'c3@x.com',
        password: 'pw123456', major: 'CS',
      });
      const res = await request(app).get(`/users/${user._id}`);
      expect(res.status).toBe(200);
      const doc = extractDoc(res.body);
      expect(String(doc._id)).toBe(String(user._id));
    });

    it('returns 404 for a non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/users/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });
});