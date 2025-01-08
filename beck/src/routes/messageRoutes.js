const express = require('express');
const {
  createMessage,
  getMessages,
  deleteMessage,
  updateMessage,
} = require('../controllers/messageController');
const router = express.Router();

router.post('/', createMessage);
router.get('/:chatId', getMessages);
router.delete('/:messageId', deleteMessage);
router.put('/:messageId', updateMessage);

module.exports = router;
