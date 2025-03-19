const { UserRoom } = require('../models/userRoom.model.js');

const create = ({ userId, roomId }) => {
  return UserRoom.create({ userId, roomId });
};

const addMember = ({ userId, roomId }) => {
  return UserRoom.create({ userId, roomId });
};

const findMember = ({ userId, roomId }) => {
  return UserRoom.findOne({ where: { userId, roomId } });
};

module.exports = { userRoomService: { create, addMember, findMember } };
