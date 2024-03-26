'use strict';

function getRemoves(oldMembers, newMembers) {
  return oldMembers.filter(value => !newMembers.includes(value));
}

module.exports = { getRemoves };
