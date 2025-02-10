const { Router } = require('express');
const roomController = require('../controllers/room.controller');

const roomRoute = new Router();

roomRoute.post('/', roomController.create);
roomRoute.get('/', roomController.getAllRooms);
roomRoute.patch('/:roomId', roomController.update);
roomRoute.delete('/:roomId', roomController.remove);

module.exports = {
  roomRoute,
};
