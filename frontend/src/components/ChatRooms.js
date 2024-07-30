import { useEffect, useState } from 'react';
import axios from 'axios';

export const ChatRooms = ({ userName }) => {
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [roomToDelete, setRoomToDelete] = useState('');
  const [updateRoom, setUpdateRoom] = useState({
    newName: '',
    oldName: '',
  });

  const currentRoom = rooms.find(room => room.id === +selectedRoom);
  const selectedRoomName = currentRoom ? currentRoom.name : 'No room selected';

  useEffect(() => {
    axios.get('http://localhost:5700/rooms').then(response => {
      setRooms(response.data);
    })
  }, [])

  useEffect(() => {
    axios.get(`http://localhost:5700/messages/${+selectedRoom}`).then(response => {
      setMessages(response.data);
    })
  }, [selectedRoom])

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5777');

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'messageAdd':
          if (data.payload.chat_id === +selectedRoom) {
            setMessages([data.payload, ...messages])
          }
          break;
        case 'removeRoom':
          setRooms(rooms.filter(room => room.id !== +data.payload))

          if (+selectedRoom === +data.payload) {
            setMessages([]);
          }
          break;
        case 'updateRoom':
          setRooms(rooms.map(room => {
            if (room.id === +data.payload.id) {
              return data.payload;
            }

            return room;
          }));
          break;
        case 'addRoom':
          setRooms([...rooms, data.payload]);
          break;
        default:
          break;
      }
    });

    return () => socket.close();
  }, [messages, rooms, selectedRoom]);

  const handleMessageSend = (event) => {
    event.preventDefault();

    if (message.trim()) {
      const newMessage = {
        author: userName,
        time: new Date().toLocaleString(),
        text: message,
        chat_id: +selectedRoom,
      }

      axios.post('http://localhost:5700/messages', newMessage).then(response => {
        setMessages([response.data, ...messages]);
      })
    }
  };

  const handleRoomCreate = (event) => {
    event.preventDefault();

    const newNameForRoom = newRoomName.trim();

    if (!newNameForRoom) {
      return;
    }

    axios.post('http://localhost:5700/rooms', {
      name: newNameForRoom,
    }).then(response => {
      axios.get('http://localhost:5700/rooms').then(response => {
        setRooms(response.data);
        setNewRoomName('');
      });
    });
  };

  const handleRoomUpdate = (event) => {
    event.preventDefault();

    const newNameForRoom = updateRoom.newName.trim();

    if (!newNameForRoom || !updateRoom.oldName) {
      return;
    }

    const roomToUpdate = rooms.find(room => room.name === updateRoom.oldName);

    axios.patch(`http://localhost:5700/rooms/${roomToUpdate.id}`, {
      name: newNameForRoom,
    })
    .then(response => {
      axios.get('http://localhost:5700/rooms').then(response => {
        setRooms(response.data);
      });
    });
  };

  const handleRoomDelete = (event) => {
    event.preventDefault();

    if (!roomToDelete) {
      return;
    }

    axios.delete(`http://localhost:5700/rooms/${+roomToDelete}`);

    setRooms([...rooms.filter(room => room.id !== +roomToDelete)]);

    if (selectedRoom === roomToDelete) {
      setSelectedRoom(0);
      setMessages([]);
    }
  };

  return (
    <>
      <h1>Create room</h1>
      <form onSubmit={handleRoomCreate}>
        <label htmlFor="newRoomName">Enter new room name:</label>
        <input
          type="text"
          id="newRoomName"
          value={newRoomName}
          onChange={event => setNewRoomName(event.target.value)}
        />
        <button type="submit">Create new room</button>
      </form>

      <h1>Update existing room</h1>
      <form onSubmit={handleRoomUpdate}>
        <label htmlFor="roomToUpdate">Select room which you would like to update.</label>
        <select
          value={updateRoom.oldName}
          onChange={event => setUpdateRoom({
            ...updateRoom,
            oldName: event.target.value,
          })}
          id="roomToUpdate"
        >
          <option disabled={!!updateRoom.oldName}>No room to update</option>
          {rooms.map(room => (
            <option key={room.id} value={room.name}>
              {room.name}
            </option>
          ))}
        </select>
        <label htmlFor="newRoomName">Enter new room name:</label>
        <input
          type="text"
          id="newRoomName"
          value={updateRoom.newName}
          onChange={event => setUpdateRoom({
            ...updateRoom,
            newName: event.target.value,
          })}
        />
        <button type="submit">Update room</button>
      </form>

      <h1>Delete room</h1>
      <form onSubmit={handleRoomDelete}>
        <label htmlFor="roomToDelete">Select room which you would like to delete:</label>
        <select
          value={roomToDelete}
          onChange={event => setRoomToDelete(event.target.value)}
          id="roomToDelete"
        >
          <option value="0">No room to delete</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
        <button type="submit">Delete room</button>
      </form>

      <h1>Join Room</h1>
      <select
        value={selectedRoom}
        onChange={event => setSelectedRoom(event.target.value)}
      >
        <option value="0" >No selected room</option>
        {rooms.map(room => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>
      <h2>Selected room: {selectedRoomName}</h2>

      {!!selectedRoom && (
        <>
          <form onSubmit={handleMessageSend}>
            <label htmlFor="message">What would you like to say?</label>
            <input
              type="text"
              id="message"
              placeholder="Message text here"
              value={message}
              onChange={event => setMessage(event.target.value)}
            />
            <button type="submit">Send message</button>
          </form>
          <div>
            {messages.map(message => (
              <p key={message.id}>
                {`${message.author} - ${message.time}: ${message.text}`}
              </p>
            ))}
          </div>
        </>
      )}
    </>
  );
}