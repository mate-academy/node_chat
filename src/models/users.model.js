const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');
const { ApiError } = require('../exceptions/api.error');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    activationToken: {
      type: DataTypes.UUID,
    },

    pendingEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    emailChangeToken: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.UUID,
    },
  },
  {
    tableName: 'users',
    createdAt: false,
    updatedAt: false,
  },
);

const services = {
  getAll: async () => {
    const users = await User.findAll();

    return users;
  },
  getById: async (id) => {
    const user = await User.findByPk(id);

    return user;
  },
  register: async (email, username, password, activationToken) => {
    const newUser = await User.create({
      email,
      username,
      password,
      activationToken,
    });

    return newUser;
  },
  activate: async (activationToken) => {
    const user = await User.findOne({ where: { activationToken } });

    return user;
  },
  normalize: ({ id, email, username }) => {
    return { id, email, username };
  },
  getByEmail: async (email) => {
    const user = await User.findOne({ where: { email } });

    return user;
  },
  setUsername: async (id, username) => {
    const user = await User.findByPk(id);

    if (!user) {
      throw ApiError.notFound({ user: 'User Not Found' });
    }

    user.username = username;

    await user.save();

    return user;
  },
  setPendingEmail: async (id, pendingEmail, emailChangeToken) => {
    const user = await User.findByPk(id);

    if (!user) {
      throw ApiError.notFound({ user: 'User Not Found' });
    }

    user.pendingEmail = pendingEmail;
    user.emailChangeToken = emailChangeToken;

    await user.save();

    return user;
  },

  confirmEmailChange: async (emailChangeToken) => {
    const user = await User.findOne({
      where: { emailChangeToken },
    });

    if (!user) {
      throw ApiError.notFound({
        token: 'Invalid email change token',
      });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = null;
    user.emailChangeToken = null;

    await user.save();

    return user;
  },
  setResetPasswordToken: async (id, token) => {
    const user = await User.findByPk(id);

    if (!user) {
      throw ApiError.notFound({ user: 'User not found' });
    }

    user.resetPasswordToken = token;

    await user.save();

    return user;
  },

  getByResetToken: async (token) => {
    return User.findOne({
      where: {
        resetPasswordToken: token,
      },
    });
  },
};

module.exports = { services, User };
