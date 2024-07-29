/* eslint-disable no-console */
const { messageService } = require('../service/message.service');
const WebSocket = require('ws');
const wss = require('../websocket/websocket');

const send = async (req, res) => {
  const { messageText, roomId, userId } = req.body;

  if (!messageText || !roomId || !userId) {
    return res
      .status(400)
      .send('Message text, room ID, and user ID are required');
  }

  try {
    const message = await messageService.create(messageText, roomId, userId);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });

    res.status(201).send(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Server error');
  }
};

const getAll = async (req, res) => {
  try {
    const messages = await messageService.getAll();

    res.status(200).send(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Server error');
  }
};

const getLastMessageByRoomId = async (req, res) => {
  const { roomId } = req.body;

  if (!roomId) {
    return res.status(400).send('Room ID is required');
  }

  try {
    const lastMessage = await messageService.getLastMessageByRoomId(roomId);

    if (lastMessage) {
      res.status(200).send(lastMessage);
    } else {
      res.status(200).send({});
    }
  } catch (error) {
    console.error('Error fetching last message:', error);
    res.status(500).send('Server error');
  }
};

const messageController = {
  send,
  getAll,
  getLastMessageByRoomId,
};

module.exports = {
  messageController,
};
