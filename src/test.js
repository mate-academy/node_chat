const request = require('supertest');
const app = require('./index');

describe('Chat API', () => {
  it('should save a message in the general room', async () => {
    const res = await request(app)
      .post('/rooms/general/messages')
      .send({ author: 'Arber', text: 'Hello from test.js' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('author', 'Arber');
    expect(res.body).toHaveProperty('text', 'Hello from test.js');
    expect(res.body).toHaveProperty('time');
  });
});
