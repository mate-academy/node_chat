const express = require('express');
const {
  controller: roomsController,
} = require('../controllers/rooms.controller');
const { catchError } = require('../utils/catchError');
const { roomOwnerMiddleware } = require('../middlewares/owner.middleware');

const router = express.Router();

router.get('/', catchError(roomsController.getAll));

router.get('/search', catchError(roomsController.search));

router.post('/', catchError(roomsController.create));

router.post('/add', catchError(roomsController.addRoom));

router.patch('/:id', roomOwnerMiddleware, catchError(roomsController.update));

router.delete('/:id', catchError(roomsController.delete));

module.exports = { router };
