import { Model } from 'sequelize';

export class Message extends Model {
  static associate(models) {
    Message.belongsTo(models.User, { foreignKey: 'userId' });
    Message.belongsTo(models.Room, { foreignKey: 'roomId' });
  }
}

export const initialization = (sequelize, DataTypes) => {
  Message.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Message',
    },
  );

  return Message;
};
