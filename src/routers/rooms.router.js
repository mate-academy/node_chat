'use strict';

const express = require('express');
const roomController = require('../controllers/rooms.controller');
const { catchError } = require('../middlewares/catchError');

const roomRouter = express.Router();

roomRouter.post('/', catchError(roomController.create));

roomRouter.patch('/:roomId', catchError(roomController.rename));

roomRouter.delete('/:roomId', catchError(roomController.remove));

roomRouter.get('/:roomId/users', catchError(roomController.getRoomUsers));

roomRouter.patch('/:roomId/join', catchError(roomController.join));

roomRouter.patch('/:roomId/leave', catchError(roomController.leave));

roomRouter.get('/user/:userId', catchError(roomController.getUserRooms));

roomRouter.get(
  '/user/:userId/available',
  catchError(roomController.getAvailableRooms),
);

module.exports = { roomRouter };
