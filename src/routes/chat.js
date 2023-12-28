'use strict';

const express = require('express');
const chatController = require('../controllers/chat');
const router = express.Router();

router.post('/', chatController.createMessage);
router.get('/:room?', chatController.getMessages);

module.exports = router;
