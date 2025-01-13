import { Model } from 'sequelize';

export class Room extends Model {
  static associate(models) {
    Room.belongsTo(models.User, { foreignKey: 'userId' });

    Room.hasMany(models.Message, { foreignKey: 'roomId' });

    Room.belongsToMany(models.User, {
      through: models.UsersRooms,
      foreignKey: 'roomId',
    });
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
