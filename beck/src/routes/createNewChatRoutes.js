const express = require('express');
const {
  createChat,
  returnAllUsers,
} = require('../controllers/createNewChatController.js');
const router = express.Router();

router.post('/selectUsers', returnAllUsers);
router.post('/', createChat);

module.exports = router;
