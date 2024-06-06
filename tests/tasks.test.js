const { request } = require('./setup');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const jwt_secret_key = 'taskmanager';
const bcrypt = require('bcrypt');
describe('Task Endpoints', () => {
  let token;
  let user;

  beforeAll(async () => {
    user = new User({
      name: 'Task User',
      email: 'taskuser@example.com',
      password: await bcrypt.hash('password123', 10),
    });
    await user.save();
    token = jwt.sign({ _id: user._id }, jwt_secret_key);
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  it('should create a new task', async () => {
    const res = await request
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New Task',
        description: 'Task description',
        status: 'pending',
        priority: 'medium',
        due_date: '2024-06-15T00:00:00Z',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('task');
    expect(res.body.task.title).toBe('New Task');
  });

  it('should retrieve user tasks', async () => {
    const res = await request
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('New Task');
  });

  it('should retrieve a specific task by id', async () => {
    const task = user.tasks[0];
    const res = await request
      .get(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'New Task');
  });

  it('should update a task', async () => {
    const task = user.tasks[0];
    const res = await request
      .put(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Task',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Task updated successfully');
  });

  it('should delete a task', async () => {
    const task = user.tasks[0];
    const res = await request
      .delete(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Task deleted successfully');
  });
});
