import { FormEvent, useEffect, useState } from "react";
import { RoomsList } from "../../components/rooms-list";
import { Room } from "../../types/room";
import "./chat.scss";
import { Avatar } from "../../components/avatar";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { MessageList } from "../../components/message-list";
import { useData } from "../../data/useData";
import axios from "axios";
import { NewRoomForm } from "../../components/new-room-form";
import { CurrentRoom } from "../../components/current-room";

export const ChatPage = () => {
  const { chatName } = useParams();
  const navigate = useNavigate();

  const {
    data: { rooms },
  } = useData();

  const { userName, deleteUserName } = useUser();
  const [newMessage, setNewMessage] = useState("");

  const color = "black";
  const currentRoom = rooms.find((room) => room.name === chatName);

  const handleSelectRoom = (room: Room) => {
    navigate(`/chat/${room.name}`);
  };

  const handleSubmitNewMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    axios.post("http://localhost:4000/messages", {
      userName,
      text: newMessage,
      roomId: currentRoom?.id,
    });
    setNewMessage("");
  };

  const handleExitRoom = () => {
    navigate("/chat");
  };

  return (
    <div className="chat">
      <div className="chat__user">
        <Avatar name={userName} backgroundColor={color} />
        <div>{userName}</div>
        <button className="chat__user-exit" onClick={deleteUserName}>
          Logout
        </button>
      </div>
      <div className="chat__rooms">
        <RoomsList
          rooms={rooms}
          currentRoomId={currentRoom?.id}
          onSelect={handleSelectRoom}
          onExitRoomClick={handleExitRoom}
        />
      </div>
      <div className="chat__current-room">
        {currentRoom ? <CurrentRoom room={currentRoom} /> : <NewRoomForm />}
      </div>
      <div className="chat__messages">
        {chatName ? (
          <MessageList messages={currentRoom?.messages || []} />
        ) : (
          <div>Select a room to start a conversation</div>
        )}
      </div>
      <div className="chat__new-message">
        <form onSubmit={handleSubmitNewMessage} className="chat__form">
          <input
            className="chat__input"
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};
