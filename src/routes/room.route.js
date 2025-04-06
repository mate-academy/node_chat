const express = require('express');
const {
  getRooms,
  addRoom,
  renameRoom,
  deleteRoom,
} = require('../controllers/room.controller');
const { catchError } = require('../utils/catchError');

const roomRouter = new express.Router();

roomRouter.get('/rooms', catchError(getRooms));
roomRouter.post('/rooms', catchError(addRoom));
roomRouter.delete('/rooms/:id', catchError(deleteRoom));
roomRouter.patch('/rooms/:id', catchError(renameRoom));

module.exports = {
  roomRouter,
};
