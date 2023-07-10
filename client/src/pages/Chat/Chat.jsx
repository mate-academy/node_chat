import { Messages } from "../../components/Messages/Messages";
import { RoomAndUsers } from "../../components/RoomAndUsers/RoomAndUsers";
import { SendMessage } from "../../components/SendMessage/SendMessage";
import './Chat.css';

export const Chat = ({ socket, room, username }) => {
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
