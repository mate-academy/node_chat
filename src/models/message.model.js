const { DataTypes } = require('sequelize');
const { client } = require('../utils/db.js');
const { Room } = require('./room.model.js');
const { User } = require('./user.model.js');

const Message = client.define('message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // userId: {
  //   type: DataTypes.UUID,
  //   allowNull: false,
  // },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

Message.belongsTo(Room, {
  onDelete: 'CASCADE',
});
Room.hasMany(Message);

Message.belongsTo(User);
// Message.belongsTo(User, {
//   foreignKey: 'userId',
// });

module.exports = {
  Message,
};
