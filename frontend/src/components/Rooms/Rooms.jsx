import { useEffect, useState } from 'react';
import classnames from 'classnames';
import './rooms.css';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeUserFromStorage } from '../../features/user/userSlice'
import { addRooms, deleteRooms, getRooms, renameRoom } from '../../features/rooms/roomsSlice';

function sortedRooms(rooms, idUser) {
  return [...rooms].sort((prev, next) => {
      if (prev.idUser === +idUser) {
        return -1;
      }
      if (next.idUser === +idUser) {
        return 1;
      }

      return prev.idUser - next.idUser;;
    })
}

export function Rooms({
  user,
  userLoading
}) {
  const roomsState = useSelector(state => state.rooms);
  const navigator = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        navigator('/');

        return;
      }

      dispatch(getRooms())
    }
  }, [user, userLoading, dispatch, navigator]);

  const [newRoom, setNewRoom] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [idFieldToRename, setIdFieldToRename] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  async function handlerActionRoom(action) {
    if (!selectedRoom) {
      return;
    }

    if (action === 'delete') {
      await dispatch(deleteRooms(selectedRoom));
      await dispatch(getRooms());
      setSelectedRoom(null);

      return;
    }

    if (action === 'rename') {
      setIdFieldToRename(selectedRoom?.id);
      setRenameValue(selectedRoom?.roomname);
      setSelectedRoom(null);
    }
  }

  function handlerButtonSelectRoom(room) {
    if (selectedRoom?.id === room?.id) {
      setSelectedRoom(null);

      return;
    }

    setSelectedRoom(room);
  }

  async function submitNewRoom(e) {
    e.preventDefault();

    await dispatch(addRooms({ roomname: newRoom, userId: user?.id}));
    dispatch(getRooms());
    setNewRoom('')
  }

  function handlerBackClick() {
    dispatch(removeUserFromStorage());
    navigator('/');
  }

  async function handlerRenameRoom(e, data) {
    e.preventDefault();

    await dispatch(renameRoom({ ...data, roomname: renameValue }));
    await dispatch(getRooms());

    if (true) {
      setIdFieldToRename(null);
    }
  }

  function handlerRoomClick(e, roomId) {
    if (e.target.dataset?.target === 'button-action-room') {
      return;
    }

    navigator('/chat/' + roomId);
  }

  return (
    <div className='container-rooms'>
      <button
        className='back'
        onClick={handlerBackClick}
      >
        &larr;
      </button>
      <h1>Welcome, {user?.username}.</h1>

      <div className='container-rooms'>
        <div className='container-actions'>
          <form
            className='form-add-room'
            onSubmit={submitNewRoom}
          >
            <input
              onChange={(e) => setNewRoom(e.target.value)}
              value={newRoom}
              type="text"
              placeholder='Room Name'
            />

            <button
              type='submit'
              className='btn-action add'
            >add room</button>
          </form>

          <ul className='list-of-actions'>
            <li>
              <button
                type='button'
                className='btn-action rn'
                onClick={() => handlerActionRoom('rename')}
                disabled={!selectedRoom}
              >rename room</button>
            </li>
            <li>
              <button
                type='button'
                className='btn-action del'
                onClick={() => handlerActionRoom('delete')}
                disabled={!selectedRoom}
              >delete room</button>
            </li>
          </ul>
        </div>

        <div className='container-rooms overflow'>
          <ul className='list-of-rooms'>
            {sortedRooms(roomsState.rooms, user?.id).map(({roomname, id, idUser}) => (
              <li key={id}>
                <div
                  type='button'
                  className="contaimer-of-room"
                  onClick={e => handlerRoomClick(e, id)}
                >
                  {idUser === user?.id && (
                    <button
                      type="button"
                      data-target="button-action-room"
                      className={classnames({
                        "btn-select": true,
                        selected: selectedRoom?.id === id,
                      })}
                      onClick={() => handlerButtonSelectRoom({roomname, id})}
                    />
                  )}
                  <p>{roomname}</p>
                  {idFieldToRename === id && (
                    <form
                     className='rename-form'
                     data-click='false'
                     onSubmit={(e) => handlerRenameRoom(e, {roomname, id})}
                     data-target="button-action-room"
                    >
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        data-target="button-action-room"
                      />

                      <button type="submit" data-target="button-action-room">rename</button>
                    </form>
                  )}

                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
};
