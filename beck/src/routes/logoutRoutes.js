const express = require('express');
const { logout } = require('../controllers/logoutController');
const router = express.Router();

router.delete('/', logout);

module.exports = router;
