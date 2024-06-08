export function getNameRoom(rooms, idRoom) {
  const room = rooms.filter(({ id }) => id === +idRoom);

  if (room.length === 0) {
    return;
  }

  return room[0].roomname;
};
