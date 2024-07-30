const { Router } = require('express');
const { roomsController } = require('../controllers/rooms.controller');

const roomsRouter = Router();

roomsRouter.get('/', roomsController.getAll);
roomsRouter.post('/', roomsController.create);
roomsRouter.patch('/:id', roomsController.update);
roomsRouter.delete('/:id', roomsController.deleteRoom);

module.exports = {
  roomsRouter,
};
