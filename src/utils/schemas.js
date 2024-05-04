'use strict';

const yup = require('yup');

const wsMessageSchema = yup.object().shape(
  {
    text: yup.string().trim().min(1).max(200).required(),
    author: yup
      .string()
      .trim()
      .min(8)
      .max(16)
      .matches(/^[a-zA-Z0-9]+$/)
      .required(),
    roomId: yup
      .string()
      .uuid()
      .when('directId', {
        is: undefined,
        then: (roomId) => roomId.required(),
      }),
    directId: yup
      .string()
      .uuid()
      .when('roomId', {
        is: undefined,
        then: (directId) => directId.required(),
      }),
  },
  [['roomId', 'directId']],
);

module.exports = {
  wsMessageSchema,
};
