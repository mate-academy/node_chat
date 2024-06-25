const express = require('express');

const messages = express.Router();

const messagesList = [];

messages.use('/messages', (req, res) => {
  const text = req.body;

  const newMessage = {
    id: messagesList[messagesList.length - 1].id + 1 || 1,
    text,
    createDate: new Date(Date.now()).toISOString(),
  };

  messagesList.push(newMessage);

});

module.exports = messages;
