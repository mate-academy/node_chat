// Використовуємо Map для зручного пошуку кімнати за ID
const rooms = new Map();

// Створюємо кімнату за замовчуванням при старті сервера
const DEFAULT_ROOM_ID = 'general';

rooms.set(DEFAULT_ROOM_ID, {
  id: DEFAULT_ROOM_ID,
  name: 'General',
  messages: [],
});

// Отримати список усіх кімнат (без повідомлень, для рендеру сайдбару)
export const getAllRooms = () => {
  return Array.from(rooms.values()).map((room) => ({
    id: room.id,
    name: room.name,
  }));
};

// Отримати конкретну кімнату (з історією повідомлень)
export const getRoomById = (id) => {
  return rooms.get(id);
};

// Створити нову кімнату
export const createRoom = (name) => {
  // Генеруємо простий унікальний ID
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2);

  const newRoom = {
    id,
    name,
    messages: [],
  };

  rooms.set(id, newRoom);

  return newRoom;
};

// Перейменувати кімнату
export const renameRoom = (id, newName) => {
  const room = rooms.get(id);

  if (room) {
    room.name = newName;

    return true;
  }

  return false;
};

// Видалити кімнату
export const deleteRoom = (id) => {
  // Захист від видалення головної кімнати
  if (id === DEFAULT_ROOM_ID) {
    return false;
  }

  return rooms.delete(id);
};
