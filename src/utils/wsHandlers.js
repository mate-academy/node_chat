const { Message } = require('../models/Message');
const { Room } = require('../models/Room');
const { User } = require('../models/User');

let broadcastMessages, broadcastRoomList;

const initHandlers = (broadcastFns) => {
  broadcastMessages = broadcastFns.broadcastMessages;
  broadcastRoomList = broadcastFns.broadcastRoomList;
};

const handleRoomList = () => broadcastRoomList();

const handleJoinRoom = async (ws, payload) => {
  const { room: roomName, username } = payload;

  if (!roomName || !username) {
    return;
  }

  const user = await User.findOne({
    where: { username },
  });

  const room = await Room.findOne({
    where: { name: roomName },
  });

  ws.username = username;
  ws.userId = user.id;
  ws.room = roomName;
  ws.roomId = room.id;

  const messages = await Message.findAll({
    where: { roomId: room.id },
    include: [{ model: User, attributes: ['username'] }],
    order: [['time', 'ASC']],
  });

  const formattedMessages = messages.map((msg) => ({
    text: msg.text,
    author: msg.user.username,
    time: msg.time,
  }));

  ws.send(
    JSON.stringify({
      type: 'history',
      payload: formattedMessages,
    }),
  );
};

const handleCheckUserRights = async (ws, payload) => {
  const { room: roomName, username } = payload;
  const room = await Room.findOne({
    where: { name: roomName },
  });
  const user = await User.findOne({
    where: { username },
  });

  if (!user || !room) {
    return;
  }

  const userCanEditRoom = user.id === room.userId;

  ws.send(
    JSON.stringify({
      type: 'user-rights',
      payload: userCanEditRoom,
    }),
  );
};

const handleAddMessage = async (ws, payload) => {
  const { text } = payload;
  const message = await Message.create({
    text,
    roomId: ws.roomId,
    userId: ws.userId,
  });
  const newMessage = { ...message.toJSON(), author: ws.username };

  broadcastMessages(newMessage, ws);
};

const handleCreateRoom = async (ws, payload) => {
  const { name, username } = payload;

  const existing = await Room.findOne({ where: { name } });

  if (existing) {
    ws.send(
      JSON.stringify({
        type: 'error',
        payload: 'Room with this name already exists',
      }),
    );

    return;
  }

  let user = await User.findOne({ where: { username } });

  if (!user) {
    user = await User.create({ username });
  }

  await Room.create({ name, userId: user.id });

  broadcastRoomList();

  ws.send(
    JSON.stringify({
      type: 'user-rights',
      payload: true,
    }),
  );
};

const handleRenameRoom = async (ws, payload) => {
  const { oldName, newName } = payload;

  const room = await Room.findOne({ where: { name: oldName } });

  if (!room) {
    return;
  }

  const user = await User.findOne({ where: { username: ws.username } });

  if (!user || room.userId !== user.id) {
    return;
  }

  const exists = await Room.findOne({ where: { name: newName } });

  if (exists) {
    return;
  }

  room.name = newName;
  await room.save();
  broadcastRoomList();
};

const handleDeleteRoom = async (ws, payload) => {
  const { name } = payload;
  const room = await Room.findOne({ where: { name } });

  await Message.destroy({
    where: { roomId: room.id },
  });

  await Room.destroy({
    where: { name },
  });

  broadcastRoomList();
};

module.exports = {
  initHandlers,
  handleRoomList,
  handleJoinRoom,
  handleCheckUserRights,
  handleAddMessage,
  handleCreateRoom,
  handleRenameRoom,
  handleDeleteRoom,
};
