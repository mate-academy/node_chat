const express = require('express');
const { getUserInfo } = require('../controllers/userController.js');
const router = express.Router();

router.get('/info', getUserInfo);

module.exports = router;
