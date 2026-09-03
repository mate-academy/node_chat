'use strict';

const prisma = require('../prismaClient');
const { broadcast } = require('../realtime');

function listMessages(roomId) {
  return prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: 'asc' },
  });
}

async function createMessage(roomId, author, text) {
  const message = await prisma.message.create({
    data: { author, text, roomId },
  });

  broadcast('message:created', message);

  return message;
}

module.exports = { listMessages, createMessage };
