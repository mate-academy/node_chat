'use strict';

const roomService = require('../services/roomService');
const { EVENTS } = require('../../../shared/constants');

const roomController = {
  getRooms(req, res) {
    try {
      const rooms = roomService.getRooms();

      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createRoom(req, res) {
    try {
      const { name, owner } = req.body;

      const room = roomService.createRoom({ name, owner });

      const io = req.app.get('io');

      io.emit(EVENTS.ROOM_LIST, roomService.getRooms());

      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = roomController;
