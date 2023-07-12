import { useNavigate } from "react-router-dom";
import { Messages } from "../../components/Messages/Messages";
import { RoomAndUsers } from "../../components/RoomAndUsers/RoomAndUsers";
import { SendMessage } from "../../components/SendMessage/SendMessage";
import './Chat.css';
import { useEffect } from "react";

export const Chat = ({ socket, room, username }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!room && !username) {
      navigate('/', { replace: true });
    }
  }, [socket])

  return (
    <div className="chatContainer">
       <RoomAndUsers socket={socket} username={username} room={room} />
      <div>
        <Messages socket={socket} />
        <SendMessage socket={socket} username={username} room={room} />
      </div>
    </div>
  );
};
