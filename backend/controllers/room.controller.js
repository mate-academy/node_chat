const ApiError = require('../exeptions/api.error');
const { getAllRooms, createRoom, changeNameRoom, getRoom, removeRoom } = require('../services/room.services');
const { getUser } = require('../services/user.services');

async function getAll(req, res) {
  const rooms = await getAllRooms();

  if (!rooms) {
    throw ApiError.notFound('Rooms not found');
  }

  res.json(rooms)
}

async function create(req, res) {
  const { roomname, userId } = req.body;

  const user = await getUser(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const room = await createRoom(roomname, userId);

  if (!room) {
    throw ApiError.notFound('Rooms not found');
  }

  res.json(room)
}

async function changeName(req, res) {
  const { roomname, id } = req.body;

  const room = await changeNameRoom(roomname, id);

  if (!room) {
    throw ApiError.notFound('error rename room');
  }

  res.json(room)
}

async function remove(req, res) {
  const { idRoom } = req.params;

  const room = await getRoom(idRoom);

  if (!room) {
    throw ApiError.notFound('room not found');
  }

  const result = await removeRoom(idRoom);

  if (!result) {
    throw ApiError.cannotRemove();
  }

  res.json(result);
}

module.exports = {
  roomController: {
    getAll,
    create,
    changeName,
    remove
  }
}
