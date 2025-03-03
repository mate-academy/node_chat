import Joi from 'joi';

const userSchema = Joi.object({
  username: Joi.string().min(2).max(50).required(),
});

const messageSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required(),
});

const roomSchema = Joi.object({
  title: Joi.string().min(1).max(50).required(),
  description: Joi.string().min(1).max(1000),
});

export const validationSchemas = {
  userSchema,
  messageSchema,
  roomSchema,
};
