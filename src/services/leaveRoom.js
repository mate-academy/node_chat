export const leaveRoom = (userId, chatRoomUsers) => {
  return chatRoomUsers.filter(user => user.id !== userId);
};
