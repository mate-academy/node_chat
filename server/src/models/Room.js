import { v4 } from 'uuid';
import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: v4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Room;
