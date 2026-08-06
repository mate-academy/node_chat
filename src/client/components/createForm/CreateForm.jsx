import classNames from 'classnames';
import { useState } from 'react';

export const CreateForm = ({
  roomCreate,
  roomSelected,
  rooms,
  rename,
  deleteRoom,
  author,
  setAuthor,
  isUser,
  setIsUser,
  currentRoom,
}) => {
  const [createRoom, setCreateRoom] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreate, setIsCreate] = useState(false);

  const handleCreateRoom = (event) => {
    event.preventDefault();

    if (!createRoom) {
      setIsCreate(true);

      return;
    }

    roomCreate(createRoom);
    setCreateRoom('');
  };

  const handleSelected = (event) => {
    const selectedRoom = event.target.value;

    if (!selectedRoom) {
      return;
    }
    roomSelected(selectedRoom);
  };

  const handleRename = () => {
    if (!currentRoom) {
      alert('select a room to rename');

      return;
    }

    if (!newRoomName) {
      return;
    }
    rename(newRoomName);
    setNewRoomName('');
  };

  const handleDelete = () => {
    if (!currentRoom) {
      return;
    }

    const roomToDelete = rooms.find((r) => r.id === currentRoom);

    if (!roomToDelete) {
      return;
    }

    if (currentRoom === 'general') {
      alert('It is impossible to delete the general room.');
    } else if (currentRoom) {
      deleteRoom(roomToDelete);
    }
  };

  return (
    <form className="form__field" onSubmit={handleCreateRoom}>
      <div className="field">
        <div className="control has-icons-left has-icons-right">
          <input
            className={classNames('input', { 'is-danger': isUser })}
            type="text"
            placeholder="Enter a username"
            value={author}
            onChange={(event) => {
              const user = event.target.value;

              setAuthor(user);

              if (user) {
                setIsUser(false);
              }
            }}
          />
          <span className="icon is-small is-left">
            <i className="fas fa-user"></i>
          </span>
        </div>
      </div>

      <div className="field">
        <div className="control has-icons-left has-icons-right">
          <input
            value={createRoom}
            className={classNames('input input--margin-bottom', {
              'is-danger': isCreate,
            })}
            type="text"
            placeholder="Create room"
            onChange={(event) => {
              const cr = event.target.value;

              setCreateRoom(cr);

              if (cr) {
                setIsCreate(false);
              }
            }}
          />
          <button type="submit" className="button is-link button-create">
            Create
          </button>
          <span className="icon is-small is-left">
            <i className="fa fa-comments"></i>
          </span>
        </div>
        <div className="field">
          <label className="label">Choose a room</label>
          <div className="control__select-container">
            <div className="select">
              <select
                value={currentRoom}
                onChange={handleSelected}
                className="field__select"
              >
                <option value={''} disabled>
                  Select room
                </option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="button is-link"
              onClick={handleDelete}
              disabled={!currentRoom}
            >
              Delete room
            </button>
            <input
              value={newRoomName}
              className="input input--width"
              type="text"
              placeholder="Rename Room"
              onChange={(event) => setNewRoomName(event.target.value)}
            />
            <button
              type="button"
              className="button is-link"
              onClick={handleRename}
              disabled={!currentRoom}
            >
              Rename room
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
