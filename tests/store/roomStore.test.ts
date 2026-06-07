import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadRoomStore = async () => {
  vi.resetModules();

  const module = await import('../../src/store/roomStore.js');

  return module.roomStore;
};

describe('roomStore', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('starts with the default General room', async () => {
    const roomStore = await loadRoomStore();

    expect(roomStore.getAllRooms()).toEqual([
      {
        id: 'general',
        name: 'General',
        messages: [],
      },
    ]);
  });

  it('creates a room with a trimmed name', async () => {
    const roomStore = await loadRoomStore();

    const createdRoom = roomStore.createRoom('  Backend  ');

    expect(createdRoom).toMatchObject({
      name: 'Backend',
      messages: [],
    });
    expect(roomStore.getRoomById(createdRoom.id)).toEqual(createdRoom);
  });

  it('adds a message to an existing room', async () => {
    const roomStore = await loadRoomStore();
    const createdRoom = roomStore.createRoom('Backend');

    const message = roomStore.addMessageToRoom(
      createdRoom.id,
      'Serhii',
      'Hello room',
    );

    expect(message).toMatchObject({
      author: 'Serhii',
      text: 'Hello room',
    });
    expect(message?.time).toEqual(expect.any(String));
    expect(roomStore.getRoomById(createdRoom.id)?.messages).toEqual([message]);
  });

  it('deletes a room and removes it from the store', async () => {
    const roomStore = await loadRoomStore();
    const createdRoom = roomStore.createRoom('Backend');

    const deletedRoom = roomStore.deleteRoom(createdRoom.id);

    expect(deletedRoom).toEqual(createdRoom);
    expect(roomStore.getRoomById(createdRoom.id)).toBeNull();
  });
});
