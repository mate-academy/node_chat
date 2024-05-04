function validateName(value) {
  if (!value) {
    return 'Name is required';
  }
}

module.exports = {
  validateName,
};
