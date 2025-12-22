const express = require('express');
const { roomsController } = require('../controllers/rooms.controller');
const router = express.Router();

router.get('/', roomsController.getAll);
router.post('/', roomsController.create);

router.get('/:id', roomsController.getById);
router.delete('/:id', roomsController.remove);
router.patch('/:id', roomsController.update);

module.exports = router;
