import { useEffect, useState } from "react";
import { Chat } from "./Chat";

interface Room {
  id: string;
  name: string;
}

export function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);

  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");

  const joinRoom = (roomId: string) => {
    setCurrentRoom(roomId);
  }
  
  useEffect(() => {
    fetch('http://localhost:5000/rooms')
      .then(res => res.json())
      .then(data => setRooms(data));
  }, []);

  const handleCreateRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newRoomName.trim().length < 3) {
          return alert("Назва кімнати повинна містити не менше 3 символів");
    }
    
    const isExist = rooms.find(r => r.name === newRoomName);
    if (isExist) return alert("Така кімната вже існує!");

    fetch('http://localhost:5000/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newRoomName }),
    })
      .then(res => res.json())
      .then(savedRoom => {
        setRooms([...rooms, savedRoom]);
        setNewRoomName('');
      });
  }

  const handleDeleteRoom = (id: string) => {
    if (!confirm("Ви впевнені, що хочете видалити кімнату?")) {
      return;
    }
    
    fetch(`http://localhost:5000/rooms/${id}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRooms(rooms.filter(room => room.id !== id));
        }
      });
  }

  const handleRenameRoom = (id: string, currentName: string) => {
    const newName = window
      .prompt("Введіть нову назву кімнати:", currentName);

    if (!newName || newName.trim().length < 3) {
      return alert("Назва кімнати повинна містити не менше 3 символів");
    }

    fetch(`http://localhost:5000/rooms/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName.trim() }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRooms(rooms.map(room =>
            room.id === id
              ? { ...room, name: newName.trim() }
              : room
          ));
        }
      });
  }

  const name = rooms.find(room => room.id === currentRoom)?.name;

  if (currentRoom) {
      return (
      <section id="center" className="mt">
          <h2>Кімната: {name}</h2>
          <Chat roomId={currentRoom} />
          <button
            type="button"
            className="counter mt"
            onClick={() => setCurrentRoom(null)}
          >
            Вийти з кімнати
          </button>
      </section>
    )
  }

    return (
        <section id="center" className="mt">
        <h2>Кімнати</h2>
        <form onSubmit={handleCreateRoom}>
          <input
            type="text"
            placeholder="Назва кімнати"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <button
            type="submit"
            className="counter ml"
          >
            Створити
          </button>
        </form>
            <ul>
                {rooms.map(room => (
                  <li key={room.id}>
                    {room.name}
                    <button
                      type="button"
                      className="counter ml"
                      onClick={() => joinRoom(room.id)}
                    >
                      Увійти
                    </button>
                    <button
                      type="button"
                      className="counter-red ml"
                      onClick={() => handleDeleteRoom(room.id)}
                    >
                      Видалити
                    </button>
                    <button
                      type="button"
                      className="counter-pink ml"
                      onClick={() => handleRenameRoom(room.id, room.name)}
                    >
                      Перейменувати
                    </button>
                  </li>
                ))}
            </ul>
        </section>
    )
}