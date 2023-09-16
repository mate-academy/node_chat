import React, { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../../context/appContext";
import ChatInput from "../ChatInput/ChatInput";
import ChatConversation from "../ChatConversation/ChatConversation";
import "./ClientChat.scss";
import { messageService } from "../../services/messageService";

export const ClientChat = () => {
  //#region Get user and its setting function from context
  const { user } = useContext(AppContext);
  //#endregion

  //#region Get room from context
  const { currentRoom } = useContext(AppContext);
  //#endregion

  //#region Launch listener and set chatMessages
  const [chatMessages, setChatMessages] = useState([]);
  //#endregion

  //#region Get initial messages list
  useEffect(() => {
    if (currentRoom?.id) {
      messageService
        .getAllForRoom(currentRoom.id)
        .then((messages) => setChatMessages(messages))
        .catch(() => {});
    }
  }, [currentRoom?.id]);
  //#endregion

  //#region Listen to new messages
  const [currentSocket, setCurrentSocket] = useState(null);

  const sendMessage = async (message) => {
    currentSocket.send(message);
  };

  useEffect(() => {
    const socket = new WebSocket(
      `${process.env.REACT_APP_WEBSOCKET_URL}/?roomId=${currentRoom?.id}`
    );

    socket.onopen = () => {
      setCurrentSocket(socket);
    };

    socket.addEventListener("message", (event) => {
      const message = event.data;

      setChatMessages((messages) => [...messages, JSON.parse(message)]);
    });

    return () => {
      socket.close();
      setCurrentSocket(null);
    };
  }, [currentRoom?.id]);
  //#endregion

  //#region Ref
  const myRef = useRef();

  function scrolltoBottom() {
    if (myRef.current) {
      myRef.current.scrollTop = myRef.current.scrollHeight;
    }
  }
  //#endregion

  //#region Messages list scroll
  useEffect(() => {
    scrolltoBottom();
  }, [chatMessages]);
  //#endregion

  //#region Check who sent the message
  const checkIsSender = (message) => {
    return message?.userId === user?.id;
  };
  //#endregion

  //#region Render
  return (
    <>
      <div className={"client-chat"}>
        <h1 className={"client-chat__header"}> {currentRoom.name} </h1>
        <div className={"client-chat__container"} ref={myRef}>
          <ChatConversation
            chatMessages={chatMessages}
            checkIsSender={checkIsSender}
          />
        </div>

        <ChatInput sendMessage={sendMessage} />
      </div>
    </>
  );
  //#endregion
};

export default ClientChat;
