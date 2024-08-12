import { Model } from 'sequelize';

export class Room extends Model {
  static associate(models) {
    Room.belongsTo(models.User);
    Room.hasMany(models.Message);
    Room.belongsToMany(models.User, { through: models.UsersRooms });
  }
}

export const initialization = (sequelize, DataTypes) => {
  Room.init(
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
      modelName: 'Room',
    },
  );

  return Room;
};
