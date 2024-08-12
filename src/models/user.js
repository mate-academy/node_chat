import { Model } from 'sequelize';

export class User extends Model {
  static associate(models) {
    User.hasMany(models.Room);
    User.hasMany(models.Message);
    User.belongsToMany(models.Room, { through: models.UsersRooms });
  }
}

export const initialization = (sequelize, DataTypes) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
    },
  );

  return User;
};
