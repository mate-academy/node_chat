const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { User } = require('./user.model.js');
const { Room } = require('./room.model.js');

const Message = client.define(
  'message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    updatedAt: false,
  },
);

Message.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Message, { foreignKey: 'userId' });

Message.belongsTo(Room, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Room.hasMany(Message, { foreignKey: 'roomId' });

module.exports = { Message };
