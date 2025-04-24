import Joi from 'joi';

export function validateUserData(data) {
  const JoiSchema = Joi.object({
    userName: Joi.string().min(4).messages({
      'string.min': 'Must be at least 4 characters',
    }),
    password: Joi.string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[^\w]/)
      .regex(/[0-9]/)
      .messages({
        'string.min': 'Must be at least 8 characters',
        'string.pattern.base':
          'Must include at least one Upper and Lower case ' +
          'and one special character.',
      }),
    confirmPassword: Joi.any()
      .equal(Joi.ref('password'))
      .required()
      .label('confirmPassword')
      .messages({ 'any.only': '{{#label}} does not match' }),

    email: Joi.string().email().optional().messages({
      'string.email': 'Must be a valid email',
    }),
  }).options({ abortEarly: false });
  const res = JoiSchema.validate(data);

  return res.error?.details;
}

export function validateNewPassword(data) {
  const JoiSchema = Joi.object({
    password: Joi.string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[^\w]/)
      .regex(/[0-9]/)
      .messages({
        'string.min': 'Must be at least 8 characters',
        'string.pattern.base':
          'Must include at least one Upper and Lower case ' +
          'and one special character.',
      }),

    confirmPassword: Joi.any()
      .equal(Joi.ref('password'))
      .required()
      .label('confirmPassword')
      .messages({ 'any.only': '{{#label}} does not match' }),
  }).options({ abortEarly: true });

  const res = JoiSchema.validate(data);

  return res.error?.details;
}

export function validateUserEmail(data) {
  const JoiSchema = Joi.object({
    email: Joi.string().email().optional().messages({
      'string.email': 'Must be a valid email',
    }),

    confirmEmail: Joi.any()
      .equal(Joi.ref('email'))
      .required()
      .label('Confirm email')
      .messages({ 'any.only': '{{#label}} does not match' }),
  }).options({ abortEarly: true });
  const res = JoiSchema.validate(data);

  if (res?.error?.message) {
    const label = res?.error.details[0].context?.label || 'unknown';

    return { [label]: res?.error?.message };
  }

  return null;
}

export function validateChatRoomName(data) {
  const JoiSchema = Joi.object({
    name: Joi.string()
      .min(4)
      .regex(/^[a-zA-Z0-9_-]+$/)
      .messages({
        'string.min': 'Must be at least 4 characters',
        'string.pattern.base':
          'Name must include only letters, numbers, underscores, and hyphens.',
      }),
  }).options({ abortEarly: true });
  const res = JoiSchema.validate(data);

  if (res?.error?.message) {
    const label = res?.error.details[0].context?.label || 'unknown';

    return { [label]: res?.error?.message };
  }

  return null;
}
