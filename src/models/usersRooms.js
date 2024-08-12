import { Model } from 'sequelize';

export class UsersRooms extends Model {
  static associate() {
  }
}

export const initialization = (sequelize, DataTypes) => {
  UsersRooms.init({
  }, {
    sequelize,
    modelName: 'UsersRooms',
  });
  return UsersRooms;
};
