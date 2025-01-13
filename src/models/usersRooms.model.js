import { Model } from 'sequelize';

export class UsersRooms extends Model {
  static associate(models) {
    UsersRooms.belongsTo(models.User, { foreignKey: 'userId' });

    UsersRooms.belongsTo(models.Room, { foreignKey: 'roomId' });
  }
}

export const initialization = (sequelize, DataTypes) => {
  UsersRooms.init(
    {
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      roomId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Rooms',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'UsersRooms',
    },
  );

  return UsersRooms;
};
