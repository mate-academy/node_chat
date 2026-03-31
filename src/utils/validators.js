export const validateUsername = (value) => {
  const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

  if (!value) {
    return 'Username is required';
  }

  if (!USERNAME_PATTERN.test(value)) {
    return '3-20 chars, letters, numbers, _';
  }
};

export const validateRoomname = (value) => {
  const USERNAME_PATTERN = /^[a-zA-Z0-9]+(?:[ _-][a-zA-Z0-9]+)*$/;

  if (!value) {
    return 'Roomname is required';
  }

  if (!USERNAME_PATTERN.test(value)) {
    return '3-20 chars, letters, numbers, _ or -';
  }
};

export const validateRoomId = (value) => {
  const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!value) {
    return 'Room ID is required';
  }

  if (!UUID_PATTERN.test(value)) {
    return 'Invalid Room ID format';
  }
};

export const validateMessage = (value) => {
  if (!value || value.trim() === '') {
    return 'Write a message to send';
  }
};
