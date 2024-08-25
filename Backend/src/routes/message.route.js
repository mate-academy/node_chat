const router = require('express').Router();
const { catchError } = require('../utils/catchError');
const messageController = require('../controllers/message.controller');

router.get('/:id', catchError(messageController.getAll));
router.post('/', catchError(messageController.create));

module.exports = router;
