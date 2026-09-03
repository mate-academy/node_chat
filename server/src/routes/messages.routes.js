'use strict';

const { Router } = require('express');
const messagesController = require('../controllers/messagesController');

// mergeParams lets this router read :roomId from the parent router (rooms.routes.js)
const router = Router({ mergeParams: true });

router.get('/', messagesController.getMessages);
router.post('/', messagesController.createMessage);

module.exports = router;
