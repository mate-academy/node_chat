const express = require('express');
const { roomController } = require('../controllers/room.controller.js');
const { Utils } = require('../utils/utils.js');

const roomRouter = express.Router();

roomRouter.get('/chatRooms', Utils.catchError(roomController.getRooms));
roomRouter.get('/getRoom/:id', Utils.catchError(roomController.getRoomById));
roomRouter.post('/createRoom', Utils.catchError(roomController.create));
roomRouter.post('/deleteRoom', Utils.catchError(roomController.deleteRoom));
roomRouter.post('/editRoom', Utils.catchError(roomController.edit));

module.exports = { roomRouter };
