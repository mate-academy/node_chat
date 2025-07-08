/* eslint-disable max-len */

const prisma = require('../utils/db.js');

async function createChat(name) {
  return prisma.chat.create({
    data: {
      name,
    },
  });
}

async function getChatById(id) {
  return prisma.chat.findUnique({
    where: {
      id,
    },
  });
}

async function getChatByName(name) {
  return prisma.chat.findUnique({
    where: {
      name,
    },
  });
}

async function addChatMember(userId, chatId) {
  return prisma.chatMember.create({
    data: {
      userId,
      chatId,
    },
  });
}

async function getChatsForUser(userId) {
  return prisma.chatMember.findMany({
    where: {
      userId,
    },
    include: {
      chat: true,
    },
  });
}

async function getAllChats(userId) {
  return prisma.chat.findMany({
    where: {
      NOT: {
        chatMembers: {
          some: {
            userId,
          },
        },
      },
    },
  });
}

async function getMessagesForChat(chatId) {
  return prisma.message.findMany({
    where: {
      chatId,
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      sender: true,
    },
  });
}

async function createMessage(chatId, senderId, content) {
  return prisma.message.create({
    data: {
      chatId,
      senderId,
      content,
    },
    include: {
      sender: true,
    },
  });
}

async function renameChat(chatId, newName) {
  return prisma.chat.update({
    where: {
      id: chatId,
    },
    data: {
      name: newName,
    },
  });
}

async function deleteChat(chatId) {
  await prisma.message.deleteMany({
    where: {
      chatId: chatId,
    },
  });

  await prisma.chatMember.deleteMany({
    where: {
      chatId: chatId,
    },
  });

  return prisma.chat.delete({
    where: {
      id: chatId,
    },
  });
}

const chatRepository = {
  createChat,
  getChatById,
  getChatByName,
  addChatMember,
  getChatsForUser,
  getMessagesForChat,
  createMessage,
  getAllChats,
  renameChat,
  deleteChat,
};

module.exports = chatRepository;
