'use strict';

const express = require('express');

const authController = require('./auth.controller');

const router = express.Router();

router.post('/login', authController.login);
router.post('/CreatingRoom', authController.CreatingRoom); // /GETRoom

router.get('/GETRoom', authController.GETRoom);
router['delete']('/DeleteRoom', authController.deleteRoom);
router.patch('/PatchRoom', authController.PatchRoom);
router.post('/CreateMessage', authController.CreateMessage);
router.get('/GETMessages', authController.GETMessages);
module.exports = router;
