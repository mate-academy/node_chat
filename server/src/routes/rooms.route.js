const express = require('express');

const { roomsControllers } = require('../controllers/room.controller');

const router = express.Router();

router.get('/', roomsControllers.getRooms);
router.get('/:id', roomsControllers.getRoom);
router.post('/', roomsControllers.createRoom);
router.delete('/:id', roomsControllers.removeRomm);

module.exports = { roomsRouter: router };
