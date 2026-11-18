'use strict';

const express = require('express');
const roomsController = require('../controllers/rooms.controller');

const router = express.Router();

router.get('/', roomsController.getAll);
router.post('/', roomsController.create);
router.patch('/:id', roomsController.rename);
router.delete('/:id', roomsController.remove);

module.exports = router;
