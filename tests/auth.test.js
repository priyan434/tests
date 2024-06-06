const { request } = require('./setup');
const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
describe('Authentication Endpoints', () => {
  let token;

  beforeAll(async () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
    });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  it('should register a new user', async () => {
    const res = await request.post('/api/register').send({
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    const res = await request.post('/api/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should not login with incorrect credentials', async () => {
    const res = await request.post('/api/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid email or password');
  });
});
