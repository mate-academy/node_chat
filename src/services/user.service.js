import { User } from '../models/User.js';

export const normalize = ({ id, name }) => {
  return { id, name };
};

export const createUser = (name) => {
  return User.create({ name });
};
