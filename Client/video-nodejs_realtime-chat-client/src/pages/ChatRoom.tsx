import { MessageForm } from "../MessageForm"
import {useState,useEffect} from 'react'
import { MessageList } from "../MessageList.jsx";
import { useNavigate, useParams } from "react-router";
import { socket } from "../socket.ts";
import { messageService } from "../services/messageService.ts";
export const ChatRoom = () => {

  const { roomId } = useParams()
   const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
   useEffect(() => {
      const fetchAll = async () => {
        const allMessage = await messageService.getAllRoomMessages(roomId);
        setMessages(allMessage);
      };
      fetchAll();
   }, [roomId]);

useEffect(() => {
  const handler = (message) => {
    setMessages(prev => [...prev, message]);
  };

  socket.on('message:sent', handler);

  return () => {
    socket.off('message:sent', handler);
  };
}, []);

useEffect(() => {
  const handleRoomDeleted = ({ id }) => {
    if (Number(roomId) === id) {

      navigate('/rooms');
    }
  }

  socket.on('roomDeleted', handleRoomDeleted);
  return () => socket.off('roomDeleted', handleRoomDeleted);
}, [roomId]);
  return (<>
    {roomId && <section className='section content'>
      <h1>{`Room number ${roomId} open now!`}</h1>
      <MessageForm

        roomId={roomId}
      />
      <MessageList messages={messages} />
      </section>}
  </>)
}
