const Chat = require('../models/chat.js');
const Message = require('../model/message.js');

Chat.hasMany(Message);
Message.belongsTo(Chat);
