function validateName(value) {
  if (!value || value.length < 3) {
    return 'Should be at least 3 characters';
  }

  if (value.match('["]')) {
    return 'Name must not contain double quotes';
  }
}

function validateText(value) {
  if (!value.trim()) {
    return 'Text is required';
  }
}

module.exports = {
  validateName,
  validateText,
};
