const roomsController = require('../controllers/rooms.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const Router = require('express').Router;
const { catchError } = require('../utils/catchError');

const roomsRoute = Router();

roomsRoute.get('/', authMiddleware, catchError(roomsController.getAll));
roomsRoute.post('/', authMiddleware, catchError(roomsController.create));
roomsRoute.patch('/:id', authMiddleware, catchError(roomsController.update));
roomsRoute.delete('/:id', authMiddleware, catchError(roomsController.remove));

module.exports = { roomsRoute };
