const { Op } = require('sequelize');
const ChatOfUser = require('../models/ChatOfUser');

const { wss } = require('../server');

exports.sendByWS = async (chatId, userId, typeOfPayload, payload) => {
  const listOfChatClientsWithoutOwnID = await ChatOfUser.findAll({
    where: { ChatId: chatId, UserId: { [Op.ne]: userId } },
    attributes: ['UserId'],
    raw: true,
  });

  const listOfUserIds = listOfChatClientsWithoutOwnID.map(
    (user) => user.UserId,
  );

  wss.clients.forEach((connection) => {
    const { userId: connectionId } = connection;

    if (listOfUserIds.includes(connectionId)) {
      connection.send(JSON.stringify({ type: typeOfPayload, payload }));
    }
  });
};
