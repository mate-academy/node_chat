'use strict';

const sequelize = require('../database/sequelize');

const RoomMember = sequelize.define(
  'RoomMember',
  {},
  {
    tableName: 'room_members',
  },
);

module.exports = RoomMember;
