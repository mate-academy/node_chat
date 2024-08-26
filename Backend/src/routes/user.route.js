const router = require('express').Router();
const { catchError } = require('../utils/catchError');
const userController = require('../controllers/user.controller');

router.get('/:id', catchError(userController.getOneById));
router.post('/', catchError(userController.create));

module.exports = router;
