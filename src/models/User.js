import { DataTypes } from 'sequelize';
import { client } from '../utils/db.js';

const User = client.define('user', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUID4,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = { User };
