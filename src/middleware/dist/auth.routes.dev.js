'use strict';

var express = require('express');

var authController = require('./auth.controller');

var router = express.Router();
router.post('/login', authController.login);
router.post('/CreatingRoom', authController.CreatingRoom); // /GETRoom

router.get('/GETRoom', authController.GETRoom);
router["delete"]('/DeleteRoom', authController.deleteRoom);
router.patch('/PatchRoom', authController.PatchRoom);
router.post('/CreateMessage', authController.CreateMessage);
router.get('/GETMessages', authController.GETMessages);
module.exports = router;