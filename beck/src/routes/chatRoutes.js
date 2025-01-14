const express = require('express');
const {
  getChats,
  exitFromChat,
  deleteChat,
  renameChat,
  addUsers,
  getUsersOfChat,
} = require('../controllers/chatController');
const router = express.Router();

router.get('/', getChats);
router.delete('/exit', exitFromChat);
router.delete('/delete', deleteChat);
router.patch('/rename', renameChat);
router.patch('/:chatId/add-users', addUsers);
router.get('/:chatId/available-users', getUsersOfChat);

module.exports = router;
