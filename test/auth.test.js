const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth');

describe('Auth Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      }
    };
    next = () => {};
  });

  it('should reject request without token', () => {
    authenticate(req, res, next);
    expect(res.statusCode).to.equal(401);
    expect(res.body).to.have.property('error', 'Access denied. No token provided.');
  });

  it('should reject invalid token', () => {
    req.headers.authorization = 'Bearer invalidtoken';
    authenticate(req, res, next);
    expect(res.statusCode).to.equal(401);
    expect(res.body).to.have.property('error', 'Invalid or expired token');
  });

  it('should accept valid token', () => {
    const token = jwt.sign({ userId: '123' }, process.env.JWT_SECRET || 'my_super_secret_key_change_me');
    req.headers.authorization = `Bearer ${token}`;
    authenticate(req, res, next);
    expect(req.userId).to.equal('123');
  });
});