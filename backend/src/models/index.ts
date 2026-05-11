import Room from "./Room.js";
import Message from "./Message.js";

Room.hasMany(Message, { foreignKey: 'roomId' });
Message.belongsTo(Room, { foreignKey: 'roomId' });

export { Room, Message };
