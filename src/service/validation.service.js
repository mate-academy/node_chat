function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 6) {
    return 'At least 6 characters';
  }

  return null;
}

function validateName(name) {
  if (!name) {
    return 'Name is required';
  }

  if (name.length < 3) {
    return 'At least 3 characters';
  }

  return null;
}

function normalize(user) {
  if (!user) {
    return null;
  }

  const { id, name, createdAt } = user;

  return {
    id,
    name,
    createdAt,
  };
}

module.exports = {
  validatePassword,
  validateName,
  normalize,
};
