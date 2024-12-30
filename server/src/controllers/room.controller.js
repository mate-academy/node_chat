const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../exeptions/api.error');
const { roomServices } = require('../services/room.services');

const getRooms = async (_, res) => {
  const rooms = await roomServices.getRooms();

  res.status(200).json(rooms);
};

const getRoom = async (req, res) => {
  const { id } = req.params;

  const room = await roomServices.getRoomById(id);

  if (!room) {
    throw ApiError.badRequest('The room is exist');
  }

  res.status(200).json(room);
};

const createRoom = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw ApiError.badRequest('Name of the room is required');
  }

  const room = await roomServices.getRoomByName(name);

  if (room) {
    throw ApiError.badRequest('The room is exist');
  }

  const newRoom = await roomServices.createRoom(name);

  res.status(201).json(newRoom);
};

const removeRomm = async (req, res) => {
  const { id } = req.params;

  const room = await roomServices.getRoomById(id);

  if (!room) {
    throw ApiError.badRequest("The room isn't exist");
  }

  await roomServices.removeRoom(id);

  res.sendStatus(204);
};

module.exports = {
  roomsControllers: {
    getRooms: asyncHandler(getRooms),
    getRoom: asyncHandler(getRoom),
    createRoom: asyncHandler(createRoom),
    removeRomm: asyncHandler(removeRomm),
  },
};
