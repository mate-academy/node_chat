import { User } from "../models/user.js";


export const usersService = {
  async findAll() {
    const response = await User.findAll();

    return response;
  },

  async getOne(name) {
    const foundUser = await User.findOne({ where: { name } });

    if (!foundUser) {
      return undefined;
    }

    return foundUser;
  },

  async addNew(name) {
    const created = await User.create({ name }, { returning: true });

    return created;
  },

  async crear() {
    await User.destroy({
      where: {}, // видалити всі рядки
      truncate: false
    })

    return true;
  }
};
