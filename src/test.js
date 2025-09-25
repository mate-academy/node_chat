const axios = require('axios');

async function run() {
  const response = await axios.post('http://localhost:3000/messages', {
    author: 'Arber',
    text: 'Hello from test.js',
  });

  // eslint-disable-next-line no-console
  console.log('Message saved: ', response.data);
}

run();
