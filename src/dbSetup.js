const { Message } = require('./models/messages.model');
const { User } = require('./models/users.model');
const { Room } = require('./models/rooms.model');
const { Token } = require('./models/token.model');
const { UserRoom } = require('./models/userRooms.model');

Message.sync({ force: true });

User.sync({ force: true });

Room.sync({ force: true });

Token.sync({ force: true });

UserRoom.sync({ force: true });
