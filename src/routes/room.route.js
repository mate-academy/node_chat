const express = require('express');
const { messageController } = require('../controllers/message.controller');
const { roomController } = require('../controllers/room.controller');
const { userController } = require('../controllers/user.controller');
const router = express.Router();

router.get('/:roomId/messages', messageController.getAll);
router.post('/:roomId/messages', messageController.createMessage);
router.delete('/:roomId/messages/:id', messageController.deleteMessage);
router.patch('/:roomId', roomController.renameRoom);
router.post('/', roomController.createRoom);
router.delete('/:roomId', roomController.deleteRoom);
router.get('/', roomController.getAll);
router.post('/:roomId', userController.joinRoom);
router.post('/:roomId/messages', messageController.createMessage);

module.exports = { router };
