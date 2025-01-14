const { Op } = require('sequelize');
const ChatOfUser = require('../models/ChatOfUser');

const { wss } = require('../server');

function sendWSMessageToUsers(userIds, type, payload) {
  wss.clients.forEach((connection) => {
    const { userId } = connection;

    if (userIds.includes(userId)) {
      connection.send(JSON.stringify({ type, payload }));
    }
  });
}

async function sendWSMessageIntoChat(chatId, userId, typeOfPayload, payload) {
  const listOfChatClientsWithoutOwnID = await ChatOfUser.findAll({
    where: { ChatId: chatId, UserId: { [Op.ne]: userId } },
    attributes: ['UserId'],
    raw: true,
  });

  const listOfUserIds = listOfChatClientsWithoutOwnID.map(
    (user) => user.UserId,
  );

  sendWSMessageToUsers(listOfUserIds, typeOfPayload, payload);
}

module.exports = {
  sendWSMessageToUsers,
  sendWSMessageIntoChat,
};
