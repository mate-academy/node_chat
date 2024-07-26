const express = require('express');
const { catchError } = require('../utils/catchError');
const { roomController } = require('../controller/room.controller');

const roomRouter = express.Router();

roomRouter.get('/', catchError(roomController.getAllRooms));
roomRouter.post('/', catchError(roomController.createRoom));
roomRouter.patch('/:id', catchError(roomController.updateRoom));
roomRouter.delete('/:id', catchError(roomController.removeRoom));

module.exports = {
  roomRouter,
};
