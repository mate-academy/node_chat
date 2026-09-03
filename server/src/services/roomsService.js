'use strict';

const prisma = require('../prismaClient');
const { broadcast } = require('../realtime');

const DEFAULT_ROOM = 'general';

function listRooms() {
  return prisma.room.findMany({ orderBy: { createdAt: 'asc' } });
}

async function createRoom(name) {
  const room = await prisma.room.create({ data: { name } });

  broadcast('room:created', room);

  return room;
}

async function renameRoom(id, name) {
  const room = await prisma.room.update({ where: { id }, data: { name } });

  broadcast('room:updated', room);

  return room;
}

async function deleteRoom(id) {
  await prisma.room.delete({ where: { id } });

  broadcast('room:deleted', { id });
}

function ensureDefaultRoom() {
  return prisma.room.upsert({
    where: { name: DEFAULT_ROOM },
    update: {},
    create: { name: DEFAULT_ROOM },
  });
}

module.exports = {
  DEFAULT_ROOM,
  listRooms,
  createRoom,
  renameRoom,
  deleteRoom,
  ensureDefaultRoom,
};
