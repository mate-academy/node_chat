const express = require('express');
const {roomController: room} = require('../controllers/room.controller.js');
const { middlewareErrorHandler } = require('../middleware/middlewareErrorHandler.js');
const checkRoomName = require('../middleware/checkRoomName.js');

const roomsRoutes = new express.Router();

roomsRoutes.get('/', middlewareErrorHandler(room.getAll));
roomsRoutes.post(
  '/create',
  checkRoomName,
  middlewareErrorHandler(room.create),
);
roomsRoutes.put(
  '/changeName',
  checkRoomName,
  middlewareErrorHandler(room.changeName),
)
roomsRoutes.delete(
  '/delete/:idRoom',
  middlewareErrorHandler(room.remove),
)

module.exports = roomsRoutes;
