'use strict';

import { Room } from '../models/roomModel.js';

const getAll = async () => {
  const result = await Room.findAll();

  return result;
};

const getById = async (id) => {
  return Room.findByPk(id);
};

const create = async ({ title, author }) => {
  return Room.create({ title, author });
};

const update = async ({ id, title }) => {
  return Room.update({ title }, { where: { id } });
};

const remove = async (id) => {
  return Room.destroy({ where: { id } });
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};
