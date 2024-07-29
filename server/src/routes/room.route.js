const express = require('express');
const { roomController } = require('../controller/room.controller');

const roomRouter = new express.Router();

roomRouter.post('/creation', roomController.create);
roomRouter.get('/getRooms', roomController.getAll);
roomRouter.delete('/deletion/:id', roomController.deleteRoom);
roomRouter.patch('/rename/:id', roomController.renameRoom);

module.exports = { roomRouter };
