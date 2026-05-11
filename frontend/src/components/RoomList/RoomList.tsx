import { type RoomListProps } from '../../types/RoomListProps';
import './RoomList.scss';

export const RoomList = ({
  handleCreateRoom,
  handleJoinRoom,
  handleRenameRoom,
  handleDeleteRoom,
  setNewRoomName,
  newRoomName,
  rooms,
  username,
}: RoomListProps) => {
  return (
    <div className='room-list'>

      <div className='room-list__create-form'>
        <input
          className='room-list__input'
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="New room name"
        />
        <button
          onClick={handleCreateRoom}
          className="room-list__button room-list__button--create"
        >
          Create chat
        </button>
      </div>

      <h1 className="room-list__title">Chat-rooms</h1>
      <ul className="room-list__items">
        {rooms.map(room => (
          <li className="room-list__item" key={room.id}>

            <span className="room-list__item-name">{room.name}</span>

            <div className="room-list__item-actions">
              <button
                className="room-list__button room-list__button--join"
                onClick={() => handleJoinRoom(room)}
              >
                join
              </button>

              {room.owner === username && (
                <>
                  <button
                    className="room-list__button room-list__button--rename"
                    onClick={() => handleRenameRoom(room.id, room.name)}
                  >
                    rename
                  </button>

                  <button
                    className="room-list__button room-list__button--delete"
                    onClick={() => handleDeleteRoom(room.id)}
                  >
                    delete
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
