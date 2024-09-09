const groupsService = require('../services/groups.service.js');

function createGroup(req, res) {
  const { name } = req.body;

  if (!name) {
    res.status(400).send('Group name is required');

    return;
  }

  const groupId = groupsService.createGroup(name);

  res.status(201).send({ id: groupId });
}

function renameGroup(req, res) {
  const { id, name } = req.body;

  if (!id) {
    res.status(400).send('Group id is required');

    return;
  }

  if (!name) {
    res.status(400).send('New group name is required');

    return;
  }

  const newGroup = groupsService.renameGroup(id, name);

  if (!newGroup) {
    res.sendStatus(404);

    return;
  }

  res.status(201).send(newGroup);
}

function deleteGroup(req, res) {
  const { id } = req.body;

  if (!id) {
    res.status(400).send('Group id is required');

    return;
  }

  const result = groupsService.deleteGroup(id);

  if (!result) {
    res.sendStatus(404);

    return;
  }

  res.status(200);
}

module.exports = {
  createGroup,
  renameGroup,
  deleteGroup,
};
