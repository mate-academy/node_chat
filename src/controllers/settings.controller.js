const { services: userServices } = require('../models/users.model');
const { ApiError } = require('../exceptions/api.error');
const bcrypt = require('bcrypt');
const { services: emailServices } = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');

const controllers = {
  setUsername: async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      throw ApiError.notFound({ username: 'Username not found' });
    }

    const updatedUser = await userServices.setUsername(id, username);

    if (!updatedUser) {
      throw ApiError.badRequest('Somethindg went wrong');
    }

    res.send(updatedUser);
  },
  setNewPassword: async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    const user = await userServices.getById(id);

    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      throw ApiError.badRequest({ password: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.send(user);
  },
  requestEmailChange: async (req, res) => {
    const { id } = req.params;
    const { password, newEmail } = req.body;

    const user = await userServices.getById(id);

    if (!user) {
      throw ApiError.notFound({
        user: 'User not found',
      });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw ApiError.badRequest({
        password: 'Password is incorrect',
      });
    }

    const existingUser = await userServices.getByEmail(newEmail);

    if (existingUser) {
      throw ApiError.badRequest({
        email: 'Email already in use',
      });
    }

    const emailChangeToken = uuidv4();

    await userServices.setPendingEmail(id, newEmail, emailChangeToken);

    await emailServices.sendEmailChangeEmail(newEmail, emailChangeToken);

    // notification to old email
    await emailServices.sendEmail({
      email: user.email,
      subject: 'Email change requested',
      html: `
      <h1>Email change requested</h1>
      <p>Your account email is being changed to ${newEmail}</p>
      <p>If this was not you, change your password immediately.</p>
    `,
    });

    res.send({
      message: 'Confirmation link sent to your new email',
    });
  },

  confirmEmailChange: async (req, res) => {
    const { token } = req.params;

    const user = await userServices.confirmEmailChange(token);

    if (!user) {
      throw ApiError.notFound({
        token: 'Invalid token',
      });
    }

    res.send(user);
  },
};

module.exports = {
  controllers,
};
