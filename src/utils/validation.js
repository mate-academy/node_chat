export function validateName(value) {
  if (!value) {
    return 'Field is required';
  }
  if (value.length < 3) {
    return 'Field should be at least 3 characters';
  }
}

export function validateId(value) {
  if (!value || isNaN(value)) {
    return 'id must be a valid number';
  }
}

export function validateAuthor(value) {
  if (!value) {
    return 'Field is required';
  }
}

export function validateText(value) {
  if (!value) {
    return 'Field is required';
  }
}
