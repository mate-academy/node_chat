import { ApiError } from '../exceptions/ApiError.js';
import { emmiter } from '../index.js';
import { messageService } from '../services/message.service.js';
import { uuidValidateV4 } from '../services/uuid.service.js';

export function validateText(value, options = { allowQuotes: false }) {
  if (!value.trim()) {
    return 'Text is required';
  }

  if (!options.allowQuotes && value.includes('"')) {
    return 'Text must not contain double quotes';
  }

  return null;
}

function validateUuid(uuid, fieldName) {
  if (!uuidValidateV4(uuid)) {
    return { [fieldName]: 'invalid syntax for type uuid' };
  }

  return null;
}

export const getMessages = async (req, res) => {
  const { id } = req.params;
  const messages = await messageService.getAll(id);

  res.send(messages);
};

export const createMessage = async (req, res) => {
  const { UserId, text, RoomId } = req.body;

  const uuidErrors = {
    ...validateUuid(UserId, 'UserId'),
    ...validateUuid(RoomId, 'RoomId'),
  };

  const errors = {
    ...uuidErrors,
    text: validateText(text, { allowQuotes: false }),
  };

  if (Object.values(errors).some(Boolean)) {
    throw ApiError.UnprocessableEntity(errors);
  }

  const message = await messageService.create(UserId, text, RoomId);

  emmiter.emit('message', message);

  res.status(201).send(message);
};
