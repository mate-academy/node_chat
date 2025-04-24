import { DataTypes } from 'sequelize';
import client from '../utils/db.js';
import { Users } from './users.js';
export const Token = client.define('token', {
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Token.belongsTo(Users);
Users.hasOne(Token);
