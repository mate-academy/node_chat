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

function validateName(value) {
  if (!value) {
    return 'Name is required';
  }

  if (value.trim().length < 2) {
    return 'At least 2 characters';
  }

  if (value.trim().length > 50) {
    return 'Maximum 50 characters';
  }

  const nameRegex = /^[A-Za-zА-Яа-яЇїІіЄєҐґ'\- ]+$/u;

  if (!nameRegex.test(value.trim())) {
    return 'Only letters, spaces, hyphens, and apostrophes are allowed';
  }

  if (/\s{2,}/.test(value.trim())) {
    return 'Avoid multiple spaces';
  }
}

export const validation = {
  validateEmail,
  validatePassword,
  validateName,
};
