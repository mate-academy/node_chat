import { messageService } from '../services/message.service.js';
import { emitter } from '../events/eventEmitter.js';
import { userService } from '../services/user.service.js';

const getMessages = async (req, res) => {
  const { roomId } = req.params;

  const messages = await messageService.getMessages(roomId);

  // emitter.once('message', (message) => {
  //   res.status(200).send(messages);
  // });
  res.status(200).send(messages);
};

const sendMessage = async (req, res) => {
  const { content, name, id } = req.body;
  const { roomId } = req.params;
  const activeUser = req.cookies.activeUser;
  // const { id } = await userService.getUser(activeUser.name);

  console.log(content, name, id);
  console.log('strange');

  const message = {
    content,
    userId: id,
    roomId,
    createdAt: new Date(),
    name,
  };

  await messageService.sendMessage(message);

  emitter.emit('message', message);

  res.status(201).send();
};

export const messageController = {
  getMessages,
  sendMessage,
};
