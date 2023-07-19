import { useNavigate } from "react-router-dom";
import { Messages } from "../../components/Messages/Messages";
import { RoomAndUsers } from "../../components/RoomAndUsers/RoomAndUsers";
import { SendMessage } from "../../components/SendMessage/SendMessage";
import './Chat.css';
import { useEffect } from "react";

export const Chat = ({ socket, room, userName, setRooms }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!room && !userName) {
      navigate('/', { replace: true });
    }
  }, [socket, navigate, userName, room])

  return (
    <div className="chat-container">
       <RoomAndUsers socket={socket} userName={userName} room={room} setRooms={setRooms} />
      <div>
        <Messages socket={socket} />
        <SendMessage socket={socket} userName={userName} room={room} />
      </div>
    </div>
  );
};
