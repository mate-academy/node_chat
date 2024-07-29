import './MessageList.scss';
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { SERVER_API, WEBSOCKET_API } from "../../constants/constants.ts";
import { MessageItem } from "../MessageItem/MessageItem.tsx";
import { Message } from "../../types/types.ts";
import { filterMessages } from "../../services/filteredMessages.ts";

type Props = {
  roomId: number,
}

export const MessageList: React.FC<Props> = ({ roomId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [userId, setUserId] = useState(-1);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('user');

    if (currentUser) {
      setUserId(JSON.parse(currentUser).id);
    }

    getAllMessages();

    ws.current = new WebSocket(WEBSOCKET_API);

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prevMessages => [...prevMessages, message]);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [])

useEffect(() => {
  const scrollToBottomInstant = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };
  scrollToBottomInstant();
}, [roomId]);

useEffect(() => {
  const scrollToBottomSmooth = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  scrollToBottomSmooth();
}, [messages]);
  

  const filteredMessages = filterMessages(roomId, messages);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const message = {
      messageText,
      roomId,
      userId,
    };

    axios
      .post(`${SERVER_API}/message/send`, message)
      .then(() => {
        setMessageText('');
      });

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const getAllMessages = () => {
    axios
      .get(`${SERVER_API}/message/getMessages`)
      .then((response) => {
        setMessages(response.data)
      })
  }

  return (
    <div className="messageList">
      <div className="messageList__list">
        {filteredMessages.map((message) => (
          <MessageItem 
            key={message.id} 
            info={message}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="messageList__list--form"
        onSubmit={(e) => handleSendMessage(e)}
      >
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="messageList__list--input"
        />
        <button className="messageList__list--button">SEND</button>
      </form>
    </div>
  );
};
