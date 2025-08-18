import { useEffect, useRef, useState } from "react"
import type { Message } from "../types/Message"
import { useNavigate } from "react-router-dom";

export const useChat = (roomId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();
  const author = localStorage.getItem('user');
  
  useEffect(()=>{

    if(!roomId) {
      navigate('/login')
    }
    const socket = new WebSocket('ws://localhost:3000');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('🟢 WebSocket відкрилось');
      socket.send(JSON.stringify({
        type: 'join', roomId
      }))
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if(data.type === 'history') {
        setMessages(data.payload);
        console.log(data.payload)
      }

      if(data.type === 'new-message') {
        setMessages((prev) => [...prev, data.payload]);
      }
    }

    socket.onclose = () => {
      console.log('🔴 WebSocket закрилось');
    }

    return () => {
      socket.close();
    }
  }, [roomId]);

  const sendMessage = (text: string) => {
    const socket = socketRef.current;
    const msg = {
      author,
      text,
      roomId
    };
    if(socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'message',
        roomId,
        message: msg
      }))
    } else {
      console.warn('🚫 Сокет закритий або ще не відкритий')
    }

  }

  return {messages, sendMessage}
}
