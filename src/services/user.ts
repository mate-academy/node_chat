import User from '../models/user';

export async function createUser(username: string, password: string) {
  return await User.create({ username, password });
}

export function findUserByUsername(username: string) {
  return User.findOne({ username });
}
