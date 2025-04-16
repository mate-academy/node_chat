const normalize = ({ id, name }) => {
  return {
    id,
    name,
  };
};

const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }

  if (name.length < 3) {
    return 'Name must be at least 3 characters long';
  }

  if (name.length > 50) {
    return 'Name must be at most 50 characters long';
  }
};

const userService = {
  normalize,
  validateName,
};

module.exports = userService;
