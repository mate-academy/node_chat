const express = require('express');
const { catchError } = require('../utils/catchError');
const roomController = require('../controllers/room.controller');

const roomRouter = new express.Router();

roomRouter.post('/create', catchError(roomController.create));
roomRouter.delete('/remove/:id', catchError(roomController.remove));
roomRouter.patch('/rename/:id', catchError(roomController.rename));

module.exports = {
  roomRouter,
};
