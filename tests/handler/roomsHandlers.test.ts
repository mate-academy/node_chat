import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/utils/utils.js', () => ({
  sendJson: vi.fn(),
}));

vi.mock('../../src/utils/readJsonBody.js', () => ({
  readJsonBody: vi.fn(),
}));

vi.mock('../../src/store/roomStore.js', () => ({
  roomStore: {
    GENERAL_ROOM_ID: 'general',
    getAllRooms: vi.fn(),
    getRoomById: vi.fn(),
    hasRoomWithName: vi.fn(),
    createRoom: vi.fn(),
    addMessageToRoom: vi.fn(),
    updateRoom: vi.fn(),
    deleteRoom: vi.fn(),
  },
}));

import {
  addMessageToRoomHandler,
  createRoomHandler,
  deleteRoomHandler,
  getRoomByIdHandler,
  getRoomsHandler,
  updateRoomHandler,
} from '../../src/handler/roomsHandlers.js';
import { roomStore } from '../../src/store/roomStore.js';
import { readJsonBody } from '../../src/utils/readJsonBody.js';
import { sendJson } from '../../src/utils/utils.js';

const request = {} as never;
const response = {} as never;

describe('roomsHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the room list', () => {
    vi.mocked(roomStore.getAllRooms).mockReturnValue([
      {
        id: 'general',
        name: 'General',
        messages: [],
      },
    ]);

    getRoomsHandler(request, response);

    expect(sendJson).toHaveBeenCalledWith(request, response, 200, {
      rooms: [
        {
          id: 'general',
          name: 'General',
          messages: [],
        },
      ],
    });
  });

  it('returns 404 when the room is missing', () => {
    vi.mocked(roomStore.getRoomById).mockReturnValue(null);

    getRoomByIdHandler(request, response, 'missing-room');

    expect(sendJson).toHaveBeenCalledWith(request, response, 404, {
      error: 'Room not found',
    });
  });

  it('creates a room when the payload is valid', async () => {
    const createdRoom = {
      id: 'room-1',
      name: 'Backend',
      messages: [],
    };

    vi.mocked(readJsonBody).mockResolvedValue({ name: ' Backend ' });
    vi.mocked(roomStore.hasRoomWithName).mockReturnValue(false);
    vi.mocked(roomStore.createRoom).mockReturnValue(createdRoom);

    await createRoomHandler(request, response);

    expect(roomStore.createRoom).toHaveBeenCalledWith('Backend');
    expect(sendJson).toHaveBeenCalledWith(request, response, 201, {
      room: createdRoom,
    });
  });

  it('returns 409 when creating a duplicate room', async () => {
    vi.mocked(readJsonBody).mockResolvedValue({ name: 'General' });
    vi.mocked(roomStore.hasRoomWithName).mockReturnValue(true);

    await createRoomHandler(request, response);

    expect(sendJson).toHaveBeenCalledWith(request, response, 409, {
      error: 'Room with this name already exists',
    });
  });

  it('updates a room name', async () => {
    const updatedRoom = {
      id: 'room-1',
      name: 'Backend 2',
      messages: [],
    };

    vi.mocked(roomStore.getRoomById).mockReturnValue({
      id: 'room-1',
      name: 'Backend',
      messages: [],
    });
    vi.mocked(readJsonBody).mockResolvedValue({ name: ' Backend 2 ' });
    vi.mocked(roomStore.hasRoomWithName).mockReturnValue(false);
    vi.mocked(roomStore.updateRoom).mockReturnValue(updatedRoom);

    await updateRoomHandler(request, response, 'room-1');

    expect(roomStore.updateRoom).toHaveBeenCalledWith('room-1', 'Backend 2');
    expect(sendJson).toHaveBeenCalledWith(request, response, 200, {
      room: updatedRoom,
    });
  });

  it('returns 400 when deleting the General room', () => {
    deleteRoomHandler(request, response, 'general');

    expect(sendJson).toHaveBeenCalledWith(request, response, 400, {
      error: 'General room cannot be deleted',
    });
  });

  it('deletes a room and returns the fallback room id', () => {
    const deletedRoom = {
      id: 'room-1',
      name: 'Backend',
      messages: [],
    };

    vi.mocked(roomStore.deleteRoom).mockReturnValue(deletedRoom);

    deleteRoomHandler(request, response, 'room-1');

    expect(sendJson).toHaveBeenCalledWith(request, response, 200, {
      deletedRoom,
      fallbackRoomId: 'general',
    });
  });

  it('adds a message to a room when the payload is valid', async () => {
    const message = {
      author: 'Serhii',
      time: '2026-06-04T12:00:00.000Z',
      text: 'Hello room',
    };

    vi.mocked(roomStore.getRoomById).mockReturnValue({
      id: 'room-1',
      name: 'Backend',
      messages: [],
    });
    vi.mocked(readJsonBody).mockResolvedValue({
      author: ' Serhii ',
      text: ' Hello room ',
    });
    vi.mocked(roomStore.addMessageToRoom).mockReturnValue(message);

    await addMessageToRoomHandler(request, response, 'room-1');

    expect(roomStore.addMessageToRoom).toHaveBeenCalledWith(
      'room-1',
      'Serhii',
      'Hello room',
    );
    expect(sendJson).toHaveBeenCalledWith(request, response, 201, {
      message,
    });
  });

  it('returns 400 when message payload is invalid', async () => {
    vi.mocked(roomStore.getRoomById).mockReturnValue({
      id: 'room-1',
      name: 'Backend',
      messages: [],
    });
    vi.mocked(readJsonBody).mockResolvedValue({
      author: 'Serhii',
      text: '   ',
    });

    await addMessageToRoomHandler(request, response, 'room-1');

    expect(sendJson).toHaveBeenCalledWith(request, response, 400, {
      error: 'Author and text are required',
    });
  });
});
