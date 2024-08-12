import { ApiError } from '../exceptions/ApiError.js';
import { userService } from '../services/userService.js';
import { uuidValidateV4 } from '../services/uuidService.js';

export function validateName(value) {
  if (!value.trim()) {
    return 'Name is required';
  }
  
  if (value.match('["]')) {
    return 'Name must not contain double quotes';
  }
}

export const getOne = async (req, res) => {
  const { id } = req.params;

  if (!uuidValidateV4(id)) {
    throw ApiError.UnprocessableEntity({
      UserId: "invalid syntax for type uuid"
    });
  }

  const user = await userService.getOne(id);
  if (!user) {
    throw ApiError.NotFound(`User with id=${id} not found`);
  }
  res.send(user);
};

export const create = async (req, res) => {
  let { name } = req.body;

  const errors = {
    name: validateName(name),
  }

  if (errors.name) {
    throw ApiError.UnprocessableEntity(errors);
  }

  const user = await userService.createOrLogIn(name);
  res.statusCode = 201;
  res.send(user);
};
