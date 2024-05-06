const express = require('express');
const roomController = require('../controllers/room.controller.js');
const { catchError } = require('../utils/catch.error.js');

const roomRouter = express.Router();

roomRouter.get('/chatRooms', catchError(roomController.getRooms));

roomRouter.get('/getRoom/:id', catchError(roomController.getRoomById));

roomRouter.post('/createRoom', catchError(roomController.create));

roomRouter.post('/deleteRoom', catchError(roomController.deleteRoom));

roomRouter.post('/editRoom', catchError(roomController.edit));

module.exports = {
  roomRouter,
};
