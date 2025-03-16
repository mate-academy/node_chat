import Joi from 'joi';

export const SchemaMessage = Joi.object({
  author: Joi.string().required(),
  text: Joi.string().required(),
  id: Joi.number().required(),
});
