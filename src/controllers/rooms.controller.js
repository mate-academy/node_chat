const { services: roomsService } = require('../models/rooms.model');
const { services: userRoomsService } = require('../models/userRooms.model');
const { sendToRoomList } = require('../websocket');

const controller = {
  getAll: async (req, res) => {
    const rooms = await roomsService.getAll(req.user.id);

    res.send(rooms);
  },

  search: async (req, res) => {
    const rooms = await roomsService.search(req.query.name);

    res.send(rooms);
  },

  create: async (req, res) => {
    const room = await roomsService.create({
      roomName: req.body.roomName,
      userId: req.user.id,
    });

    await userRoomsService.create(req.user.id, room.id);

    sendToRoomList(req.user.id, {
      type: 'addRoom',
      payload: room,
    });

    res.send(room);
  },

  addRoom: async (req, res) => {
    await userRoomsService.create(req.user.id, req.body.roomId);

    const room = await roomsService.getById(req.body.roomId);

    sendToRoomList(req.user.id, {
      type: 'addRoom',
      payload: room,
    });

    res.sendStatus(201);
  },

  update: async (req, res) => {
    const room = await roomsService.getById(req.params.id);

    if (room.userId !== req.user.id) {
      return res.sendStatus(403);
    }

    await roomsService.update(req.params.id, req.body.roomName);

    const updatedRoom = await roomsService.getById(req.params.id);

    // notify all users who have this room
    const users = await userRoomsService.getByRoomId(room.id);

    users.forEach((userRoom) => {
      sendToRoomList(userRoom.userId, {
        type: 'updateRoom',
        payload: updatedRoom,
      });
    });

    res.send(updatedRoom);
  },

  delete: async (req, res) => {
    const room = await roomsService.getById(req.params.id);

    if (room.userId === req.user.id) {
      // owner deletes room for everyone

      const users = await userRoomsService.getByRoomId(room.id);

      users.forEach((userRoom) => {
        sendToRoomList(userRoom.userId, {
          type: 'deleteRoom',
          payload: room,
        });
      });

      await userRoomsService.deleteByRoomId(room.id);

      await roomsService.delete(room.id);

      return res.send(room);
    }

    // participant leaves room

    await userRoomsService.delete(req.user.id, room.id);

    sendToRoomList(req.user.id, {
      type: 'deleteRoom',
      payload: room,
    });

    return res.sendStatus(204);
  },
};

module.exports = {
  controller,
};
