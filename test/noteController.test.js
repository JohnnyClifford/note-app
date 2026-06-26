const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/user');
const Note = require('../models/note');

describe('Note Controller Tests', () => {
  let token;
  let userId;

  before(async () => {
    await User.deleteMany({});
    await Note.deleteMany({});

    const userRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'noteuser@test.com', password: '123456' });
    
    token = userRes.body.token;
    userId = userRes.body.user.id;
  });

  after(async () => {
    await User.deleteMany({});
    await Note.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/notes', () => {
    it('should create a note', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Note', content: 'Test Content', tags: 'test, demo' });
      
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('title', 'Test Note');
      expect(res.body).to.have.property('userId', userId);
    });

    it('should reject without title', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'No title' });
      
      expect(res.status).to.equal(400);
    });
  });

  describe('GET /api/notes', () => {
    it('should get all notes for user', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should search notes', async () => {
      const res = await request(app)
        .get('/api/notes?search=Test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should filter by tag', async () => {
      const res = await request(app)
        .get('/api/notes?tag=test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).to.equal(200);
    });
  });
});