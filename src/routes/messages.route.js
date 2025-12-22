const express = require('express');
const { messagesController } = require('../controllers/messages.controller');
const router = express.Router();

router.get('/', messagesController.getAll);
router.post('/', messagesController.create);

router.get('/:id', messagesController.getById);
router.delete('/:id', messagesController.remove);
router.patch('/:id', messagesController.update);

module.exports = router;
