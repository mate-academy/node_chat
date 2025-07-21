require('dotenv/config');
const { client } = require('./src/utils/db.js');
const { User } = require('./src/models/User.js');
const { Room } = require('./src/models/Room.js');
const { Message } = require('./src/models/Message.js');

client
  .sync({ force: true })
  .then(() => {
    console.log('✅ DB synced');
    process.exit();
  })
  .catch((err) => {
    console.error('❌ DB sync error:', err);
    process.exit(1);
  });
