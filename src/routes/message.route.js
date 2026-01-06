import { Router } from 'express';
import { messageController } from '../controllers/message.controller.js';

const route = Router();

route.get('/', messageController.getAllMessages);
route.post('/', messageController.createMessage);
route.delete('/:messageId', messageController.deleteMessage);
route.put('/:messageId', messageController.updateMessage);

export default route;
