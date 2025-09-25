const axios = require('axios');

describe('Chat API', () => {
  it('should save a message in the general room', async () => {
    const response = await axios.post(
      'http://localhost:3000/rooms/general/messages',
      {
        author: 'Arber',
        text: 'Hello from test.js',
      },
    );

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('author', 'Arber');
    expect(response.data).toHaveProperty('text', 'Hello from test.js');
    expect(response.data).toHaveProperty('time');
  });
});
