const { User, Room, Message } = require('./backend/module');
const { sequelize } = require('./backend/services/db');


Message.sync({ force: true }).then(() => {
  console.log('Database & tables created!');
});
