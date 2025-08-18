import { useEffect, useState, type FormEvent } from 'react'
import type { User } from '../types/User'
import Message from '../components/Message';
import type { Message  as MessageType } from '../types/Message';
import Form from '../components/Form';
import { useNavigate, useParams } from 'react-router-dom';
import { messagesApi, roomsApi } from '../api';
import type { RoomType } from '../types/Room';
import { useChat } from '../utils/useChat';

const Chat = () => {
  const {id} = useParams();
  const [activeRoom, setActiveRoom] = useState<RoomType | null>(null);
  const author = localStorage.getItem('user');
  const {sendMessage, messages} = useChat(id);

  const getRoom = async () => {
    if(!id) return;
    try {
      const room = await roomsApi.getRoomById(id);

      setActiveRoom(room);
    } catch (error) {
      console.log(error)
    }

  }

  const handleSend = (text: string) => {
    sendMessage(text)
  }

  useEffect(() => {
    getRoom()
  }, [])

  return (
    <main className='main'>
      <h1>{author}`s Chat in {activeRoom?.name}</h1>
      <section className='section'>
        {messages.map(msg => {
          const isAuthor = msg.author === author;
          return <Message key={msg.id} message={msg} isAuthor={isAuthor}/>
        })}
      </section>
      <Form onCreate={handleSend}/>
    </main>
  )
}

export default Chat;
