import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

/* eslint-disable */

function MainChat() {
  const [Roomname, setRoomName] = useState('');
  const [NewRoomname, setNewRoomName] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [ActiveOpening, setActiveOpening] = useState(false);
  const [Error, setError] = useState('');
  const [ArrayRoom, setArrayRoom] = useState([]);
  const [PatchError, setPatchError] = useState('');
  const [Message, setMessage] = useState('');
  const [chosenRoom, setChosenRoom] = useState(0);
  const [Allmessages, setAllmessages] = useState([]);
  const [MessageError, setMessageError] = useState('');
  const navigate = useNavigate();
  const API_URL = 'http://localhost:3000';
  const username = localStorage.getItem('username');

  const chosenRoomRef = useRef(chosenRoom);

  useEffect(() => {
    chosenRoomRef.current = chosenRoom;
  }, [chosenRoom]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000');

    socket.addEventListener('message', (event) => {
      const { type, payload } = JSON.parse(event.data);

      if (type === 'message') {
        setAllmessages((current) =>
          payload.roomId === chosenRoomRef.current
            ? [...current, payload]
            : current,
        );
      }

      if (type === 'room:created') {
        setArrayRoom((rooms) => [...rooms, payload]);
      }

      if (type === 'room:updated') {
        setArrayRoom((rooms) =>
          rooms.map((r) => (r.id === payload.id ? payload : r)),
        );
      }

      if (type === 'room:deleted') {
        setArrayRoom((rooms) => rooms.filter((r) => r.id !== payload.id));
      }
    });

    return () => socket.close();
  }, []);

  function MessageSubmit(event) {
    event.preventDefault();

    if (!chosenRoom) {
      setMessageError('Choose a room first');

      return;
    }

    fetch(`${API_URL}/CreateMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        text: Message,
        roomId: chosenRoom,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          setPatchError(response.errors);
        }
      })
      .catch(() => setPatchError('Server is not available'))
      .finally(() => setMessage(''));
  }

  function PatchRoom(id, NewNameRoom) {
    setIsLoading(true);
    setPatchError('');

    fetch(`${API_URL}/PatchRoom`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id, name: NewNameRoom }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json();

          setPatchError(data.errors || 'Something went wrong');

          return;
        }

        setArrayRoom((rooms) =>
          rooms.map((room) =>
            room.id === id ? { ...room, name: NewNameRoom } : room,
          ),
        );

        setNewRoomName((prev) => ({ ...prev, [id]: '' }));
      })
      .catch(() => setPatchError('Server is not available'))
      .finally(() => {
        setIsLoading(false);
      });
  }

  function deleteRoom(id) {
    setIsLoading(true);
    setError('');

    fetch(`${API_URL}/DeleteRoom`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json();

          setError(data.errors || 'Something went wrong');

          return;
        }
        setArrayRoom((rooms) => rooms.filter((room) => room.id !== id));
      })
      .catch(() => setError('Server is not available'))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetch(`${API_URL}/GETRoom`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load rooms');
        }

        return response.json();
      })
      .then((data) => setArrayRoom(data))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (!chosenRoom) {
      return;
    }

    fetch(`${API_URL}/GETMessages?roomId=${chosenRoom}`)
      .then((r) => r.json())
      .then(setAllmessages)
      .catch(console.error);
  }, [chosenRoom]);

  function CreatingRoom(event) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    fetch(`${API_URL}/CreatingRoom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Roomname: Roomname }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json();

          setError(data.errors || 'Something went wrong');

          return;
        }

        setRoomName('');
      })
      .catch(() => setError('Server is not available'))
      .finally(() => {
        setIsLoading(false);
        setActiveOpening(false);
      });
  }

  function logout() {
    localStorage.removeItem('username');
    navigate('/');
  }

  return (
    <>
      <div className="upper_bar">
        <div className="pusto">
          <p>{username}</p>
        </div>
        <div className="just_for_normal">
          <button className="Opening" onClick={() => logout()}>
            log out
          </button>
        </div>
      </div>
      <div className="for_center">
        <div className="mainChat">
          <div className="Room_part">
            <div className="Creating_Room">
              {!ActiveOpening && (
                <button
                  className="Opening"
                  onClick={() => {
                    ActiveOpening
                      ? setActiveOpening(false)
                      : setActiveOpening(true);
                  }}
                >
                  Create a new room
                </button>
              )}

              {ActiveOpening && (
                <div className="createRoom">
                  <form onSubmit={CreatingRoom}>
                    <p className="Name Sign">Write name of your room here</p>
                    <input
                      type="text"
                      className="forSubmit"
                      value={Roomname}
                      onChange={(event) => setRoomName(event.target.value)}
                    />

                    <button
                      className="button_Sign"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? 'loading' : `Log in`}
                    </button>
                  </form>
                  {Error && <p className="Name Sign">{Error}</p>}
                </div>
              )}
            </div>

            <div className="rooms">
              {ArrayRoom.map((obj) => {
                return (
                  <div
                    className="room"
                    key={obj.id}
                    onClick={() => setChosenRoom(obj.id)}
                  >
                    <div className="Inner_Part">
                      <p className="room_name__this">{obj.name}</p>
                      <div className="Changing_room">
                        <p className="Name Sign">Write new name for room</p>
                        <div className="just_for_flex">
                          <input
                            type="text"
                            value={NewRoomname[obj.id] || ''}
                            onChange={(event) =>
                              setNewRoomName((prev) => ({
                                ...prev,
                                [obj.id]: event.target.value,
                              }))
                            }
                            required
                          />

                          <button
                            className="button_Sign"
                            type="submit"
                            disabled={isLoading}
                            onClick={() =>
                              PatchRoom(obj.id, NewRoomname[obj.id])
                            }
                          >
                            {isLoading ? 'loading' : `Change name`}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="Deleting_room">
                      <form onSubmit={deleteRoom}>
                        <button
                          className="button_Sign_delete"
                          type="submit"
                          disabled={isLoading}
                          onClick={() => deleteRoom(obj.id)}
                        >
                          X
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="Server_response">
              {PatchError && <p className="Name Sign">{PatchError}</p>}
            </div>
          </div>

          <div className="Main_chat">
            <div className="All_messages">
              {Allmessages.map((obj) => {
                return (
                  <div className="Message" key={obj.id}>
                    <p>{obj.text}</p>
                    <p>{obj.createdAt}</p>
                    <p>{obj.username}</p>
                  </div>
                );
              })}
            </div>
            {MessageError && <p className="Name Sign">{MessageError}</p>}
            <div className="messager">
              <form onSubmit={MessageSubmit}>
                <input
                  type="text"
                  value={Message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="forSubmit"
                  required
                />

                <button
                  className="button_Sign"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'loading' : `Write message`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainChat;
