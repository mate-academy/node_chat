import fs from 'fs';

const path = 'rooms.json';

const getAllRooms = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }

      const rooms = JSON.parse(data);

      resolve(rooms);
    });
  });
};
const getRoomById = (id) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }

      const rooms = JSON.parse(data);
      const room = rooms.find((r) => r.id === id);

      resolve(room);
    });
  });
};

const saveRoom = (newRoom) => {
  fs.readFile(path, 'utf8', (err, data) => {
    let rooms = [];

    if (!err && data) {
      try {
        rooms = JSON.parse(data);
      } catch (e) {
        throw e;
      }
    }

    const index = rooms.findIndex((room) => room.id === newRoom.id);

    if (index !== -1) {
      rooms[index] = newRoom;
    } else {
      rooms.push(newRoom);
    }

    fs.writeFile(path, JSON.stringify(rooms, null, 2), (e) => {
      if (e) {
        throw e;
      }
    });
  });
};

const deleteRoom = (roomId, callback) => {
  fs.readFile(path, 'utf8', (err, data) => {
    let rooms = [];

    if (!err && data) {
      try {
        rooms = JSON.parse(data);
      } catch (e) {
        return callback(e);
      }
    }

    const newRooms = rooms.filter((room) => String(room.id) !== roomId);

    fs.writeFile(path, JSON.stringify(newRooms, null, 2), (e) => {
      if (e) {
        callback(e);

        return;
      }
      callback(null);
    });
  });
};

export const roomsApi = {
  getAllRooms,
  saveRoom,
  deleteRoom,
  getRoomById,
};
