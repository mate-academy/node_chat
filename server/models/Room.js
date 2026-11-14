import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Room = sequelize.define(
  'Room',
  {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: 'rooms',
    timestamps: false,
  },
);

export default Room;
