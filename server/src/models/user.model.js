const { DataTypes } = require('sequelize');
const { client } = require('../utils/db');

const User = client.define(
  'user',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'users',
  },
);

const initUsers = async () => {
  await User.sync({ force: true });
};

module.exports = { User, initUsers };
