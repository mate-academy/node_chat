import { useEffect, useState, type FC } from "react";
import { clientApi } from "../../api/clientApi";
import type { Message as MessageType } from "../../utils/types";
import { Message } from "../../shared/Message/Message";
import { useAuth } from "../../store/authContext";

interface MessagesProps {
  roomId: string | null;
  error: string;
}

export const Messages: FC<MessagesProps> = ({ roomId, error }) => {
  const [messages, setMessages] = useState<MessageType[] | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let socket: WebSocket | null = null;

    if (roomId && user) {
      socket = new WebSocket(`ws://localhost:3005?userId=${user.id}`);
      socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "message:post":
            if (roomId === message.payload.newMessage.roomId)
              setMessages((prev) => prev ? [...prev, message.payload.newMessage] : prev);
            break;
        }
      });

      clientApi.getMessageByRoom(roomId).then((res) => {
        setMessages(res.data);
      });
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [roomId, user]);

  return (
    <main className="flex-1">
      <div className="flex flex-col p-2 md:p-8 gap-4">
        {!roomId && (
          <div>
            <h2>Choose room</h2>
          </div>
        )}

        {error && (
          <div>
            <h2>{error}</h2>
          </div>
        )}

        {!error && messages && messages.length === 0 && (
          <div>
            <h2>There are no messages in the room yet. </h2>
          </div>
        )}

        {!error &&
          messages &&
          messages.length !== 0 &&
          messages.map((message) => {
            return <Message key={message.id} message={message}></Message>;
          })}
      </div>
    </main>
  );
};

