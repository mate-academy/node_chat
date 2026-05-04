'use strict';

const { User, Message } = require('../database');
const { formatMessageDate, formatMessageTime } = require('../utils/time');

function serializeMessage(message) {
  return {
    id: message.id,
    author: message.author.username,
    date: formatMessageDate(message.createdAt),
    time: formatMessageTime(message.createdAt),
    body: message.body,
  };
}

async function serializeRoom(room, viewer) {
  const [lastMessage, members, joined] = await Promise.all([
    Message.findOne({
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
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    }),
    room.countMembers(),
    viewer ? room.hasMember(viewer) : false,
  ]);

  return {
    name: room.name,
    creatorUsername: room.creatorUsername || '',
    creatorUsernameKey: room.creatorUsernameKey || '',
    ownerUserId: room.ownerUserId,
    members,
    preview: lastMessage
      ? `${lastMessage.author.username}: ${lastMessage.body}`
      : '',
    time: lastMessage ? formatMessageTime(lastMessage.createdAt) : '',
    unread: 0,
    joined,
  };
}

module.exports = {
  serializeMessage,
  serializeRoom,
};
