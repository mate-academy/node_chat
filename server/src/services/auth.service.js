const users = [];

const login = (user) => {
  users.push(user);

  return user;
};

const findAuthor = (author) => {
  return users.find((user) => user.name === author);
};

export const userService = {
  login,
  findAuthor,
};
