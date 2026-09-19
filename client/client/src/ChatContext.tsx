import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Message, User } from "./types";
import { loginUser } from "./utils";

interface ChatContextType {
  messages: Message[];
  socketRef: React.RefObject<WebSocket | null>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sendMessage: (message: Omit<Message, "id" | "time" | "author">) => void;
  currentUser: string | null;
  handleLoginUser: (userData: User) => Promise<void>;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(() =>
    localStorage.getItem("user"),
  );
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");

    socketRef.current = socket;
    socket.addEventListener("message", (event) => {
      const result = JSON.parse(event.data);

      if (result.type === "HISTORY" && result.roomId === "general") {
        setMessages(result.data);
      } else if (result.type === "NEW_MESSAGE" && result.roomId === "general") {
        setMessages((messages) => [...messages, result.data]);
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  const handleLoginUser = async (userData: User): Promise<void> => {
    await loginUser(userData);
    setCurrentUser(userData.name);
  };

  const sendMessage = (message: Omit<Message, "id" | "time" | "author">) => {
    if (!currentUser) {
      return;
    }
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          ...message,
          type: "SEND_MESSAGE",
          author: currentUser,
        }),
      );
    }
  };

  const value = {
    messages,
    socketRef,
    setMessages,
    currentUser,
    sendMessage,
    handleLoginUser,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
