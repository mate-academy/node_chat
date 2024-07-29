export const filterMessages = (roomId, messages) => {
  return messages.filter((message) => message.roomId === roomId);
};
