function leaveRoom(userID, chatRoomUsers) {
  return chatRoomUsers.filter((user) => user.socketId !== userID);
}

module.exports = leaveRoom;
