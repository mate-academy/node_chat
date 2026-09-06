import type React from "react";
import { useState } from "react";
import { getMessages, getRoomMessages, postMessage, postRoomMessage } from "../../services/messageApi";
import './MessageForm.scss'
import type { Message } from "../../types/Message";

type Props = {
  username: string;
  roomId?: string
  userId: string;
  setMessages: (messages: Message[]) => void;
}

export const MessageForm: React.FC<Props> = ({ username, roomId, userId, setMessages }) => {
  const [text, setText] = useState('');

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

  const handleSend = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!text.trim() || !username) {
      return;
    }

    if (roomId) {
      await postRoomMessage(username, text.trim(), roomId, userId);
    } else {
      await postMessage(username, text.trim(), userId);
    }

    loadMessages();
    setText('');
  }

  return (
    <form className="messageForm" onSubmit={handleSend}>
      <input
        type="text"
        placeholder="Type a message..."
        className="messageForm__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="messageForm__send" type="submit">Send</button>
    </form>
  )
}
