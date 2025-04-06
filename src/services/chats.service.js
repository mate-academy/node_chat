'use strict';

let chats = [];

const getChatById = (id) => {
  return chats.find((chat) => chat.id === +id);
};

const addNewChat = (username, chatname) => {
  const chat = {
    id: chats.length + 1,
    chatname,
    createBy: username,
    messages: [],
  };

  chats.push(chat);

  return chat;
};

const deleteOneChat = (chatId) => {
  chats = chats.filter((chat) => chat.id !== +chatId);
};

const changeChatName = async (chatId, name) => {
  const chat = await getChatById(chatId);

  if (!chat) {
    return null;
  }

  chat.chatname = name;

  return chat;
};

const getAllChats = () => {
  return chats;
};

const addNewMessage = async (chatId, message) => {
  const chat = await getChatById(chatId);

  if (!chat) {
    return null;
  }

  const newMessage = {
    id: chat.messages.length + 1,
    text: message.text,
    sender: message.sender,
    timestamp: new Date().toISOString(),
  };

  await chat.messages.push(newMessage);

  return newMessage;
};

const getAllMessages = async (chatId) => {
  const chat = await getChatById(chatId);

  if (!chat) {
    return null;
  }

  return chat.messages;
};

module.exports = {
  getChatById,
  addNewChat,
  deleteOneChat,
  getAllChats,
  addNewMessage,
  getAllMessages,
  changeChatName,
};
