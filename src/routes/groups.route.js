const express = require('express');

const groupsController = require('../controllers/groups.controller');
const groupsRouter = express.Router();

groupsRouter.post('/create', groupsController.createGroup);
groupsRouter.post('/rename', groupsController.renameGroup);
groupsRouter.post('/delete', groupsController.deleteGroup);

module.exports = { groupsRouter };
