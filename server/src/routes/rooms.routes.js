'use strict';

const { Router } = require('express');
const roomsController = require('../controllers/roomsController');
const messagesRoutes = require('./messages.routes');

const router = Router();

router.get('/', roomsController.getRooms);
router.post('/', roomsController.createRoom);
router.patch('/:id', roomsController.renameRoom);
router.delete('/:id', roomsController.deleteRoom);
router.use('/:roomId/messages', messagesRoutes);

module.exports = router;
