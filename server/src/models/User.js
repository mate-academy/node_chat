import { v4 } from 'uuid';
import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: v4,
    primaryKey: true,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name',
  },
});

export default User;
