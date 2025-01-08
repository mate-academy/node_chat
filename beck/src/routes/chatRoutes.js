const express = require('express');
const {
  getChats,
  exitFromChat,
  deleteChat,
  renameChat,
} = require('../controllers/chatController');
const router = express.Router();

router.get('/', getChats);
router.delete('/exit', exitFromChat);
router.delete('/delete', deleteChat);
router.patch('/rename', renameChat);

module.exports = router;
