import { createRoomElement } from "./roomUI.js";

export async function createRoom(newRoom) {
  try {
    const response = await fetch('/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        room: newRoom
      })
    });
    const result = await response.text();

    return result;
  } catch (error) {
    console.error(error);
  }
};

export async function getRooms(rooms) {
  try {
    const response = await fetch('/rooms');
    const result = await response.json();
    rooms.innerHTML = '';

    result.forEach((room) => {
      const element = createRoomElement(room);
      rooms.appendChild(element);
    })

  } catch (error) {
    console.error(error);
  }
};

export async function renameRoom(oldRoom, newName) {
  try {
    const response = await fetch('/rooms', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        oldRoom,
        newName
      })
    });

    const result = await response.text();
    return result;

  } catch (error) {
    console.error(error);
  }
};

export async function deleteRoom(room) {
  try {
    const response = await fetch('/rooms', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        room,
      })
    });

    const result = await response.json();

    return result;

  } catch (error) {
    console.error(error);
  }
}
