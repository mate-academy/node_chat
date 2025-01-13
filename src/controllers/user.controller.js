import { ApiError } from '../exceptions/ApiError.js';
import { userService } from '../services/user.service.js';
import { uuidValidateV4 } from '../services/uuid.service.js';

function validateName(value) {
  if (!value.trim()) {
    return 'Name is required';
  }

  if (value.includes('"')) {
    return 'Name must not contain double quotes';
  }

  if (value.length > 50) {
    return 'Name must not exceed 50 characters';
  }

  return null;
}

function validateUuid(uuid, fieldName) {
  if (!uuidValidateV4(uuid)) {
    return { [fieldName]: 'invalid syntax for type uuid' };
  }

  return null;
}

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const errors = validateUuid(id, 'UserId');

  if (errors) {
    throw ApiError.UnprocessableEntity(errors);
  }

  const user = await userService.getOne(id);

  if (!user) {
    throw ApiError.NotFound(`User with id=${id} not found`);
  }

  res.send(user);
};

export const createOrLogInUser = async (req, res) => {
  const { name } = req.body;

  const errors = {
    name: validateName(name),
  };

  if (Object.values(errors).some((error) => error !== null)) {
    throw ApiError.UnprocessableEntity(errors);
  }

  const user = await userService.createOrLogIn(name);

  res.status(201).send(user);
};
