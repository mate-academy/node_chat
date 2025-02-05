const express = require('express');
const { roomController } = require('../controllers/room.controller.js');
const { catchError } = require('../utils/catchError.js');
const { errorMiddleWare } = require('../middlewares/errorMiddleWare.js');

const roomRouter = new express.Router();

roomRouter.get('/', errorMiddleWare, catchError(roomController.get));
roomRouter.get('/:id', errorMiddleWare, catchError(roomController.getOne));
roomRouter.post('/', errorMiddleWare, catchError(roomController.create));
roomRouter.patch('/:id', errorMiddleWare, catchError(roomController.update));
roomRouter.delete('/:id', errorMiddleWare, catchError(roomController.remove));

module.exports = { roomRouter };
