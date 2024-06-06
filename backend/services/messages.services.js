const { Message, User } = require("../module");

function getAllMessagesByIdRoom(idRoom) {
  return Message.findAll({
    where: {
      idRoom,
    },
    include: {
      model: User,
      as: 'user'
    }
  });
};

function getMessageById(id) {
  return Message.findByPk(id, {
    include: {
      model: User,
      as: 'user'
    }
  })
}

module.exports = {
  getAllMessagesByIdRoom,
  getMessageById
}
