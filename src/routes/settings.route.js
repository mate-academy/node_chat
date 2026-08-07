const express = require('express');
const { catchError } = require('../utils/catchError');
const {
  controllers: settingsControllers,
} = require('../controllers/settings.controller');
const { isUserOwnerMiddleware } = require('../middlewares/owner.middleware');

const router = express.Router();

router.patch(
  '/username/:id',
  isUserOwnerMiddleware,
  catchError(settingsControllers.setUsername),
);

router.patch(
  '/password/:id',
  isUserOwnerMiddleware,
  catchError(settingsControllers.setNewPassword),
);

router.patch(
  '/email/:id',
  isUserOwnerMiddleware,
  catchError(settingsControllers.requestEmailChange),
);

router.get(
  '/email/confirm/:token',
  catchError(settingsControllers.confirmEmailChange),
);

module.exports = {
  router,
};
