const router = require('express').Router();
const { catchError } = require('../utils/catchError');
const roomController = require('../controllers/room.controller');

router.get('/', catchError(roomController.getAll));
router.get('/:id', catchError(roomController.getOne));
router.post('/', catchError(roomController.create));
router.patch('/:id', catchError(roomController.update));
router.post('/:id', catchError(roomController.join));
router.delete('/:id', catchError(roomController.remove));

module.exports = router;
