'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

require('../models');

async function connectDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      [
        'DATABASE_URL is required in src/backend/.env',
        'src/server/.env',
        'or server/.env',
      ].join(', '),
    );
  }

  await sequelize.authenticate();
  await sequelize.sync();

  // interact with the database schema
  const queryInterface = sequelize.getQueryInterface();

  const roomColumns = await queryInterface.describeTable('rooms');

  // Add creator_username column if it doesn't exist
  if (!roomColumns.creator_username) {
    await queryInterface.addColumn('rooms', 'creator_username', {
      type: DataTypes.STRING(80),
      allowNull: true,
    });
  }

  // Add creator_username_key column if it doesn't exist
  if (!roomColumns.creator_username_key) {
    await queryInterface.addColumn('rooms', 'creator_username_key', {
      type: DataTypes.STRING(80),
      allowNull: true,
    });
  }

  if (!roomColumns.owner_user_id) {
    await queryInterface.addColumn('rooms', 'owner_user_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  }

  await sequelize.query(`
    UPDATE rooms
    SET owner_user_id = users.id
    FROM users
    WHERE rooms.owner_user_id IS NULL
      AND rooms.creator_username_key = users.username_key
  `);
}

module.exports = connectDatabase;
