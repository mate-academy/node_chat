import type { Room } from '../../types';

interface RoomListProps {
  rooms: Room[];
  activeRoomId: number | null;
  onSelect: (room: Room) => void;
  onCreate: () => void;
  onRename: (room: Room) => void;
  onDelete: (room: Room) => void;
}

const RoomList = ({
  rooms,
  activeRoomId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: RoomListProps) => {
  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Rooms</h2>

        <button
          onClick={onCreate}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          + Create
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {rooms.map((room) => (
          <li
            key={room.id}
            className={`flex items-center justify-between gap-2 rounded p-2 ${
              activeRoomId === room.id ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
          >
            <button
              onClick={() => onSelect(room)}
              className="flex-1 truncate text-left"
            >
              {room.name}
            </button>

            <div className="flex gap-2 text-xs">
              <button
                onClick={() => onRename(room)}
                className="text-gray-500 hover:text-blue-600"
              >
                Rename
              </button>

              <button
                onClick={() => onDelete(room)}
                className="text-gray-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default RoomList;
