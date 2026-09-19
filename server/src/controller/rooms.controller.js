import { roomsService } from '../services/rooms.service.js';

const getAll = (req, res) => {
  const rooms = roomsService.getAllRooms();

  res.status(200).send(rooms);
};

const getOneRoom = (req, res) => {
  const user = req.user;
  const { roomId } = req.params;

  const room = roomsService.getRoomById(roomId);

  if (!room) {
    return res.status(404).send('Not found');
  }

  const isUserInRoom = room.members.find((member) => member.name === user);

  if (!isUserInRoom) {
    return res.status(403).send('Forbidden');
  }

  res.status(200).send(room);
};

const create = (req, res) => {
  const { room } = req.body;
  const user = req.user;

  if (!room || room.name.length === 0) {
    return res.status(400).send('Bad request');
  }

  roomsService.createNewRoom(room, user);

  res.sendStatus(201);
};

const removeRoom = (req, res) => {
  const { roomId } = req.params;
  const user = req.user;

  const isUserAdmin = roomsService.isUserAdmin(user, roomId);

  if (!isUserAdmin) {
    return res.status(403).send('Forbidden resource');
  }

  if (!roomId) {
    return res.status(400).send('Bad request');
  }
  roomsService.deleteRoom(roomId);

  res.sendStatus(204);
};

const join = (req, res) => {
  const { roomId } = req.params;
  const userName = req.user;

  if (!roomId) {
    return res.status(400).send('Bad request');
  }

  const user = {
    name: userName,
  };

  roomsService.joinRoom(roomId, user);

  res.sendStatus(200);
};

const quitRoom = (req, res) => {
  const { roomId } = req.params;
  const userName = req.user;

  if (!roomId) {
    return res.status(400).send('Bad request');
  }

  roomsService.leaveRoom(roomId, userName);
  res.sendStatus(200);
};

const renameRoom = (req, res) => {
  const { roomId } = req.params;
  const user = req.user;
  const isUserAdmin = roomsService.isUserAdmin(user, roomId);
  const { newName } = req.body;

  if (!isUserAdmin) {
    return res.status(403).send('Forbidden');
  }

  if (newName.length < 4) {
    return res.status(400).send('Bad request');
  }

  roomsService.renameRoom(roomId, newName);

  res.sendStatus(200);
};

export const roomsController = {
  getAll,
  getOneRoom,
  create,
  removeRoom,
  join,
  quitRoom,
  renameRoom,
};
