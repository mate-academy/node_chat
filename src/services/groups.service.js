let groups = [];

function getGroup(id) {
  return groups[id];
}

function createGroup(name) {
  const id = groups.length;

  groups.push({
    id,
    name,
  });

  return id;
}

function renameGroup(id, name) {
  const group = groups[+id];

  if (!group) {
    return null;
  }

  group.name = name;

  return group;
}

function deleteGroup(id) {
  const oldLength = groups.length;

  groups = groups.filter((group) => group.id !== +id);

  if (groups.length === oldLength) {
    return null;
  }

  return 1;
}

module.exports = {
  getGroup,
  createGroup,
  renameGroup,
  deleteGroup,
};
