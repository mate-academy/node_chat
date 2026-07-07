const express = require('express');
const { roomController } = require('../controllers/room.controller');
const router = express.Router();

router.post('/create', roomController.createRoom);
router.patch('/rename', roomController.updateRoom);
router.delete('/:roomId', roomController.deleteRoom);
router.get('/', roomController.getRooms);
router.patch('/join', roomController.addUserToRoom);

module.exports = router;
