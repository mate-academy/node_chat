'use strict';

const express = require('express');
const roomController = require('../controllers/room');
const router = express.Router();

router.post('/', roomController.createRoom);
router.get('/', roomController.getRooms);

module.exports = router;
