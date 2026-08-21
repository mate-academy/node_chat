const express = require('express');
const {
  controller: messageController,
} = require('../controllers/message.controller');
const { catchError } = require('../utils/catchError');
const { messageOwnerMiddleware } = require('../middlewares/owner.middleware');

const router = express.Router();

router.get('/', catchError(messageController.getAll));

router.get('/room/:roomId', catchError(messageController.getAllByRoomId));

router.get('/:id', catchError(messageController.getById));

router.post('/', catchError(messageController.create));

router.delete(
  '/:id',
  messageOwnerMiddleware,
  catchError(messageController.delete),
);

router.patch(
  '/:id',
  messageOwnerMiddleware,
  catchError(messageController.update),
);

module.exports = { router };
