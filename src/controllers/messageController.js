import { ApiError } from '../exceptions/ApiError.js';
import { emmiter } from '../index.js';
import { messageService } from '../services/messageService.js';
import { uuidValidateV4 } from '../services/uuidService.js';

export function validateText(value) {
  if (!value.trim()) {
    return 'Text is required';
  }
  
  if (value.match('["]')) {
    return 'Text must not contain double quotes';
  }
}

export const get = async (req, res) => {
  const { id } = req.params;
  res.send(await messageService.getAll(id));
};


export const create = async (req, res) => {
  let { UserId, text, RoomId } = req.body;

  if (!uuidValidateV4(UserId)) {
    throw ApiError.UnprocessableEntity({
      UserId: "invalid syntax for type uuid"
    });
  }

  if (!uuidValidateV4(RoomId)) {
    throw ApiError.UnprocessableEntity({
      RoomId: "invalid syntax for type uuid"
    });
  }

  const errors = {
    text: validateText(text),
  }

  if (errors.text) {
    throw ApiError.UnprocessableEntity(errors);
  }

  const message = await messageService.create(UserId, text, RoomId);
  emmiter.emit('message', message);
  res.statusCode = 201;
  res.send(message);
};
