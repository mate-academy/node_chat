'use strict';

const express = require('express');
const roomController = require('../controllers/room');
const router = express.Router();

router.post('/', roomController.createRoom);
router.get('/', roomController.getRooms);
router.put('/:id', roomController.renameRoom);
router.post('/:id/join', roomController.joinRoom);
router.delete('/:id', roomController.removeRoom);

module.exports = router;
