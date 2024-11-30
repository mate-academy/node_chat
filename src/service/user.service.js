import { ApiError } from '../exceptions/api.error.js';
import { User } from '../modules/User.js';
import { Console } from '../utils/Console.js';

function validateEmail(value) {
  const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

  if (!value) {
    return 'Email is required';
  }

  if (!EMAIL_PATTERN.test(value)) {
    return 'Email is not valid';
  }
}

function validatePassword(value) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 6) {
    return 'At least 6 characters';
  }
}

async function validUserName(value) {
  const existUser = await User.findOne({ where: { value } });

  if (existUser) {
    return true;
  }

  return false;
}

const normalize = ({ id, email }) => {
  return { id, email };
};

async function register(userName, email, password) {
  const existUser = await User.findOne({ where: { email } });

  // console.log(existUser);

  if (existUser) {
    throw ApiError.badRequest('User already exists');
  }

  await User.create({
    userName,
    email,
    password,
  });

  Console.log(`${userName} ${email} create`);
}

export const userService = {
  validateEmail,
  validatePassword,
  validUserName,
  register,
  normalize,
};
