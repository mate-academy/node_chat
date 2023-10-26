/* eslint-disable no-console */
'use strict';

const { Chats } = require('../models/chats');

const createChat = async(ws, name, authorChat) => {
  try {
    if (!name || !authorChat) {
      ws.send('Invalid chatName or authorChat');
    } else {
      await Chats.create({
        name,
        authorChat,
      });
    }
  } catch (error) {
    console.error(error);
    ws.send('Error creating chat');
  }
};

const getChats = async() => {
  const chats = await Chats.findAll();

  return chats;
};

module.exports = {
  createChat,
  getChats,
};
