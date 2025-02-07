import messageModel from '../models/message.model.js';
import roomModel from '../models/room.model.js';
import SocketService from '../services/socket.service.js';

const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await messageModel.find({ room: roomId }).exec();

    res.json(messages);
  } catch {
    res.status(500).send('Internal Server Error');
  }
};

const createMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    let content = req.body.content;

    content = content.trim();

    if (!content || typeof content !== 'string' || content.length < 1) {
      res.status(400).send('Bad Request');

      return;
    }

    const room = await roomModel.findById(roomId).exec();

    if (!room) {
      res.status(404).send('Room not found');

      return;
    }

    const message = await messageModel.create({
      content,
      room: room._id,
      sender: req.user.username,
    });

    const io = SocketService.getInstance().getSocket();

    io.emit('message', {
      type: 'create-message',
      payload: {
        id: message._id,
        content: message.content,
        sender: message.sender,
        room: message.room,
        createdAt: message.createdAt,
      },
    });

    res.json(message);
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
};

export default {
  getMessages,
  createMessage,
};
