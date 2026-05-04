'use strict';

const { UniqueConstraintError } = require('sequelize');
const { User, Room, RoomMember, Message } = require('../database');
const {
  serializeMessage,
  serializeRoom,
} = require('../serializers/chatSerializers');
const {
  getRoomKey,
  getUsernameKey,
  normalizeRoomName,
} = require('../utils/names');

class ChatError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ChatError';
    this.status = status;
  }
}

function getCleanUsername(username) {
  return String(username || '').trim();
}

function sendRoomCreatorRequired() {
  throw new ChatError(403, 'Only the room creator can change that room.');
}

async function findOrCreateUser(username) {
  const cleanUsername = getCleanUsername(username);
  const usernameKey = getUsernameKey(cleanUsername);
  const [user] = await User.findOrCreate({
    where: { usernameKey },
    defaults: {
      username: cleanUsername,
      usernameKey,
    },
  });

  return user;
}

async function findUserByUsername(username) {
  if (!username) {
    return null;
  }

  return User.findOne({
    where: {
      usernameKey: getUsernameKey(username),
    },
  });
}

async function findRoomByName(name) {
  return Room.findOne({
    where: {
      roomKey: getRoomKey(name),
    },
  });
}

async function isRoomCreator(room, username) {
  const user = await findUserByUsername(username);

  return Boolean(
    user &&
      (room.ownerUserId === user.id ||
        (room.creatorUsernameKey &&
          room.creatorUsernameKey === user.usernameKey)),
  );
}

async function ensureRoomMember(room, user) {
  try {
    await RoomMember.findOrCreate({
      where: {
        roomId: room.id,
        userId: user.id,
      },
    });
  } catch (error) {
    if (!(error instanceof UniqueConstraintError)) {
      throw error;
    }
  }
}

async function listRoomsForUser(username) {
  const viewer = await findUserByUsername(getCleanUsername(username));
  const rooms = await Room.findAll({
    order: [
      ['createdAt', 'ASC'],
      ['id', 'ASC'],
    ],
  });

  return Promise.all(rooms.map((room) => serializeRoom(room, viewer)));
}

async function createRoomForUser(name, username) {
  const roomName = normalizeRoomName(name);
  const cleanUsername = getCleanUsername(username);

  if (!roomName) {
    throw new ChatError(400, 'Room name is required.');
  }

  if (!cleanUsername) {
    throw new ChatError(400, 'Room creator is required.');
  }

  const user = await findOrCreateUser(cleanUsername);
  let room;

  try {
    room = await Room.create({
      name: roomName,
      roomKey: getRoomKey(roomName),
      creatorUsername: user.username,
      creatorUsernameKey: user.usernameKey,
      ownerUserId: user.id,
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ChatError(409, 'A room with that name already exists.');
    }

    throw error;
  }

  await ensureRoomMember(room, user);

  return serializeRoom(room, user);
}

async function renameRoomForUser(name, nextName, username) {
  const roomName = normalizeRoomName(name);
  const cleanNextName = normalizeRoomName(nextName);
  const cleanUsername = getCleanUsername(username);
  const room = await findRoomByName(roomName);

  if (!room) {
    throw new ChatError(404, 'Room not found.');
  }

  if (!(await isRoomCreator(room, cleanUsername))) {
    sendRoomCreatorRequired();
  }

  if (!cleanNextName) {
    throw new ChatError(400, 'Room name is required.');
  }

  const oldName = room.name;

  room.name = cleanNextName;
  room.roomKey = getRoomKey(cleanNextName);

  try {
    await room.save();
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new ChatError(409, 'A room with that name already exists.');
    }

    throw error;
  }

  const viewer = await findUserByUsername(cleanUsername);

  return {
    oldName,
    room: await serializeRoom(room, viewer),
  };
}

async function deleteRoomForUser(name, username) {
  const roomName = normalizeRoomName(name);
  const cleanUsername = getCleanUsername(username);
  const room = await findRoomByName(roomName);

  if (!room) {
    throw new ChatError(404, 'Room not found.');
  }

  if (!(await isRoomCreator(room, cleanUsername))) {
    sendRoomCreatorRequired();
  }

  const deletedName = room.name;

  await room.setMembers([]);
  await room.destroy();

  return {
    name: deletedName,
  };
}

async function joinRoomForUser(name, username) {
  const roomName = normalizeRoomName(name);
  const cleanUsername = getCleanUsername(username);
  const room = await findRoomByName(roomName);

  if (!room) {
    throw new ChatError(404, 'Room not found.');
  }

  if (!cleanUsername) {
    throw new ChatError(400, 'Username is required.');
  }

  const user = await findOrCreateUser(cleanUsername);

  await ensureRoomMember(room, user);

  return serializeRoom(room, user);
}

async function leaveRoomForUser(name, username) {
  const roomName = normalizeRoomName(name);
  const cleanUsername = getCleanUsername(username);
  const room = await findRoomByName(roomName);

  if (!room) {
    throw new ChatError(404, 'Room not found.');
  }

  const user = await findUserByUsername(cleanUsername);

  if (!user) {
    throw new ChatError(404, 'User not found.');
  }

  await room.removeMember(user);

  return serializeRoom(room, user);
}

async function listMessagesForRoom(name) {
  const roomName = normalizeRoomName(name);
  const room = await findRoomByName(roomName);

  if (!room) {
    throw new ChatError(404, 'Room not found.');
  }

  const messages = await Message.findAll({
    where: {
      roomId: room.id,
    },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['username'],
      },
    ],
    order: [
      ['createdAt', 'ASC'],
      ['id', 'ASC'],
    ],
  });

  return {
    roomName: room.name,
    messages: messages.map(serializeMessage),
  };
}

async function createMessageForRoom(name, author, body) {
  const roomName = normalizeRoomName(name);
  const cleanAuthor = getCleanUsername(author);
  const cleanBody = String(body || '').trim();
  const room = await findRoomByName(roomName);

  if (!room) {
    throw new ChatError(404, 'Room not found.');
  }

  if (!cleanAuthor) {
    throw new ChatError(400, 'Message author is required.');
  }

  if (!cleanBody) {
    throw new ChatError(400, 'Message text is required.');
  }

  const user = await findOrCreateUser(cleanAuthor);

  await ensureRoomMember(room, user);

  const message = await Message.create({
    roomId: room.id,
    userId: user.id,
    body: cleanBody,
  });

  message.author = user;

  return {
    roomName: room.name,
    message: serializeMessage(message),
  };
}

module.exports = {
  ChatError,
  findOrCreateUser,
  findUserByUsername,
  findRoomByName,
  isRoomCreator,
  ensureRoomMember,
  listRoomsForUser,
  createRoomForUser,
  renameRoomForUser,
  deleteRoomForUser,
  joinRoomForUser,
  leaveRoomForUser,
  listMessagesForRoom,
  createMessageForRoom,
};
