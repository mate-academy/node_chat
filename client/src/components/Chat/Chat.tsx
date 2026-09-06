import { useCallback, useEffect, useState } from "react"
import type { Message } from "../../types/Message";
import { RoomList } from "../Rooms/RoomList";
import { MessageList } from "../MessageList";
import { MessageForm } from "../MessageForm";
import { RoomCreateForm } from "../Rooms/RoomCreateForm";
import { useParams } from "react-router-dom";
import { DataLoader } from "../../DataLoader";
import { UsernameForm } from "../UserNameForm/UserForm";
import type { Room } from "../../types/Room";
import { getMessages, getRoomMessages } from "../../services/messageApi";
import { getRooms } from "../../services/roomApi";
import './Chat.scss';
import type { User } from "../../types/User";
import { getUser } from "../../services/userApi";


export const Chat = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<Room[]>([])
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roomCreateIsOpen, setRoomCreateIsOpen] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const user = await getUser(userId);
        setUser(user);
      } catch (error) {
      console.error(error);
      localStorage.removeItem('userId');
      setUser(null);
      } finally {
      setIsLoading(false);
    }
    }

    loadUser();
  }, [])

  useEffect(() => {
    async function loadMessages() {
      setMessages([]);

      if (roomId) {
      const loadedMessages = await getRoomMessages(roomId);

      setMessages(loadedMessages);
    } else {
      const loadedMessages = await getMessages();

      setMessages(loadedMessages);
    }
    }

    loadMessages();
  }, [roomId])

  useEffect(() => {
    async function loadRooms() {
      try {
        const loadedRooms = await getRooms();
        setRooms(loadedRooms);
      } catch (error) {
        console.error("Failed to load rooms:", error);
      }
    }

    loadRooms();
  }, []);

 const saveData = useCallback((message: Message) => {
  setMessages((prev) => {
    if (prev.some((m) => m.id === message.id)) {
      return prev;
    }
    return [...prev, message];
  });
}, []);

  const createRoom = (room: Room) => {
    setRooms((prev) => [...prev, room]);
  }

  const deleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter(room => room.id !== roomId))
  }

  const onUpdate = (room: Room) => {
    setRooms((prev) => prev.map(oldRoom =>
      oldRoom.id === room.id ? room : oldRoom
      ))
  }


if (isLoading) {
  return <div>Загрузка...</div>;
}

  return (
    <div className="chat">
      <DataLoader onData={saveData} roomId={roomId} />
      {!user ? (
        <div className="modal-overlay">
          <UsernameForm onSet={setUser}/>
        </div>
      ) : (
        <>
      {roomCreateIsOpen && (
        <RoomCreateForm
          userId={user.id}
          onSet={createRoom}
          onClose={setRoomCreateIsOpen}
        />
      )}

      <RoomList
        rooms={rooms}
        userId={user.id}
        onOpen={setRoomCreateIsOpen}
        onDelete={deleteRoom}
        onUpdate={onUpdate}
      />

      <div className="chat__main">
        <MessageList messages={messages} username={user.username} />
        <MessageForm
          username={user.username}
          roomId={roomId}
          userId={user.id}
          setMessages={setMessages}
        />
      </div>
    </>
      )}
    </div>
  )
}
