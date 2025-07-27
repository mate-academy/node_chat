const { ChatMessage } = require('../models/ChatMessage');
const { ChatRoom } = require('../models/ChatRoom');
const { Account } = require('../models/Account');

let sendUpdatedMessages;
let updateRoomList;

const configureHandlers = (broadcasters) => {
  sendUpdatedMessages = broadcasters.broadcastMessages;
  updateRoomList = broadcasters.broadcastRoomList;
};

const emitRoomList = () => updateRoomList();

const joinRoom = async (ws, data) => {
  const { room: roomTitle, username } = data;

  if (!roomTitle || !username) {
    return;
  }

  const user = await Account.findOne({ where: { nickname: username } });
  const room = await ChatRoom.findOne({ where: { title: roomTitle } });

  if (!user) {
    return;
  }

  ws.nickname = username;
  ws.userId = user.id;
  ws.roomTitle = roomTitle;
  ws.roomId = room.id;

  const chatHistory = await ChatMessage.findAll({
    where: { roomId: room.id },
    include: [{ model: Account, attributes: ['nickname'] }],
    order: [['sentAt', 'ASC']],
  });

  const serialized = chatHistory.map((msg) => ({
    content: msg.content,
    author: msg.Account.nickname,
    sentAt: msg.sentAt,
  }));

  ws.send(JSON.stringify({ type: 'history', payload: serialized }));
};

const verifyEditor = async (ws, data) => {
  const { room: roomTitle, username } = data;

  const room = await ChatRoom.findOne({ where: { title: roomTitle } });
  const user = await Account.findOne({ where: { nickname: username } });

  if (!room || !user) {
    return;
  }

  const hasAccess = user.id === room.ownerId;

  ws.send(JSON.stringify({ type: 'user-rights', payload: hasAccess }));
};

const submitMessage = async (ws, data) => {
  const { content } = data;

  const entry = await ChatMessage.create({
    content,
    roomId: ws.roomId,
    userId: ws.userId,
  });

  const messageToSend = { ...entry.toJSON(), author: ws.nickname };

  sendUpdatedMessages(messageToSend, ws);
};

const createNewRoom = async (ws, data) => {
  const { name, username } = data;

  const existingRoom = await ChatRoom.findOne({ where: { title: name } });

  if (existingRoom) {
    ws.send(
      JSON.stringify({
        type: 'error',
        payload: 'ChatRoom already exists',
      }),
    );

    return;
  }

  let user = await Account.findOne({ where: { nickname: username } });

  if (!user) {
    user = await Account.create({ nickname: username });
  }

  await ChatRoom.create({ title: name, ownerId: user.id });

  updateRoomList();
  ws.send(JSON.stringify({ type: 'user-rights', payload: true }));
};

const renameExistingRoom = async (ws, data) => {
  const { oldName, newName } = data;

  const room = await ChatRoom.findOne({ where: { title: oldName } });

  if (!room) {
    return;
  }

  const user = await Account.findOne({ where: { nickname: ws.nickname } });

  if (!user || room.ownerId !== user.id) {
    return;
  }

  const alreadyTaken = await ChatRoom.findOne({ where: { title: newName } });

  if (alreadyTaken) {
    return;
  }

  room.title = newName;
  await room.save();
  updateRoomList();
};

const removeRoom = async (ws, data) => {
  const { name } = data;
  const room = await ChatRoom.findOne({ where: { title: name } });

  await ChatMessage.destroy({ where: { roomId: room.id } });
  await ChatRoom.destroy({ where: { title: name } });

  updateRoomList();
};

module.exports = {
  configureHandlers,
  emitRoomList,
  joinRoom,
  verifyEditor,
  submitMessage,
  createNewRoom,
  renameExistingRoom,
  removeRoom,
};
