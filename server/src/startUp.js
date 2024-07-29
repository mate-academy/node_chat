const { initMessages } = require('./models/message.model');
const { initUsers } = require('./models/user.model');
const { initRooms } = require('./models/room.model');

const createTables = async () => {
  await initUsers();
  await initRooms();
  await initMessages();
};

createTables();
