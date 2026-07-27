const express = require('express');
const {
  controller: authController,
} = require('../controllers/auth.controller');
const { catchError } = require('../utils/catchError');

const router = express.Router();

router.post('/register', catchError(authController.register));
router.get('/activate/:activationToken', catchError(authController.activate));
router.post('/login', catchError(authController.login));
router.get('/refresh', catchError(authController.refresh));
router.post('/logout', catchError(authController.logout));
router.post('/forgot-password', catchError(authController.forgotPassword));
router.post('/reset-password/:token', catchError(authController.resetPassword));

module.exports = {
  router,
};
