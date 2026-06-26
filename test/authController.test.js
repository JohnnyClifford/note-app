const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/user');

describe('Auth Controller Tests', () => {

  before(async () => {
    await User.deleteMany({});
  });

  after(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: '123456' });
      
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('token');
      expect(res.body.user).to.have.property('email', 'test@test.com');
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: '123456' });
      
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Email already registered');
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test2@test.com', password: '123' });
      
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Password must be at least 6 characters');
    });

    it('should reject missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: '123456' });
      
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Email and password are required');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: '123456' });
      
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' });
      
      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Invalid email or password');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: '123456' });
      
      expect(res.status).to.equal(401);
    });
  });
});