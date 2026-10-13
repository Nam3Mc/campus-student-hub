const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const Resource = require('../../models/Resource');
const { extractArray, extractDoc } = require('../helpers/response');

describe('Resources routes', () => {
  const groupId = new mongoose.Types.ObjectId();

  describe('GET /resources', () => {
    it('returns 200 and all resources', async () => {
      await Resource.create([
        { title: 'A', url: 'https://a.com', type: 'link', description: 'd1' },
        { title: 'B', url: 'https://b.com', type: 'pdf',  description: 'd2' },
      ]);
      const res = await request(app).get('/resources');
      expect(res.status).toBe(200);
      const arr = extractArray(res.body);
      expect(arr).not.toBeNull();
      expect(arr.length).toBe(2);
    });

    it('returns 200 with an empty array when none exist', async () => {
      const res = await request(app).get('/resources');
      expect(res.status).toBe(200);
      expect(extractArray(res.body)).toEqual([]);
    });
  });

  describe('GET /resources/:id', () => {
    it('returns 200 and the matching resource', async () => {
      const r = await Resource.create({
        title: 'Find me', url: 'https://x.com', type: 'link', description: 'd',
      });
      const res = await request(app).get(`/resources/${r._id}`);
      expect(res.status).toBe(200);
      const doc = extractDoc(res.body);
      expect(String(doc._id)).toBe(String(r._id));
    });

    it('returns 404 for a non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/resources/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /resources/group/:groupId', () => {
    it('returns 200 and resources for the group', async () => {
      const StudyGroup = require('../../models/StudyGroup');
      const group = await StudyGroup.create({
        name: 'G', course: 'CS', description: 'd',
        ownerId: new mongoose.Types.ObjectId(),
      });
    
      await Resource.create([
        {
          title: 'G', url: 'https://g.com', type: 'link',
          description: 'd', groupId: group._id,
        },
      ]);
    
      const res = await request(app).get(`/resources/group/${group._id}`);
      expect(res.status).toBe(200);
      const arr = extractArray(res.body);
      expect(arr).not.toBeNull();
      expect(arr.length).toBe(1);
    });
  });

});