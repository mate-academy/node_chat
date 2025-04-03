/* eslint-disable no-console */
import fs from 'fs';

export function getRooms() {
  try {
    const data = fs.readFileSync('src/server/db.json');

    return Object.keys(JSON.parse(data));
  } catch (err) {
    console.error('Error reading db.json:', err);

    return [];
  }
}

export function formatMessage(username, message) {
  return {
    username,
    message,
    time: new Date().toLocaleTimeString(),
  };
}

export function addMessageToRoom(room, message) {
  fs.readFile('src/server/db.json', (_err, data) => {
    const rooms = JSON.parse(data);

    if (rooms[room]) {
      rooms[room].push(message);

      fs.writeFile('src/server/db.json', JSON.stringify(rooms), (err) => {
        if (err) {
          console.error('Error writing to db.json:', err);
        }
      });
    }
  });
}
