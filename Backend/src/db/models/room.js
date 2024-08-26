'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      Room.belongsTo(models.User);
      Room.hasMany(models.Message);
      Room.belongsToMany(models.User, { through: 'Chats', as: 'chatUsers' });
    }
  }

  Room.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },

    {
      sequelize,
      modelName: 'Room',
    },
  );

  return Room;
};
