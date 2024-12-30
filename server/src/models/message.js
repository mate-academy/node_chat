const { DataTypes, UUIDV4 } = require('sequelize');
const { sequelize } = require('../utils/db.js');
const { User } = require('./user.js');
const { Room } = require('./room.js');

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'messages',
  },
);

Message.belongsTo(User, { foreignKey: 'userId' });
Message.belongsTo(Room, { foreignKey: 'roomId' });

module.exports = {
  Message,
};
