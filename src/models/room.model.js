const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.model.js');

const Room = client.define(
  'room',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);

Room.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Room, { foreignKey: 'userId' });

module.exports = { Room };
