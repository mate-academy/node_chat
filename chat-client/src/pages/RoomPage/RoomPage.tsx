import { Link, useNavigate, useParams } from "react-router"
import { useEffect, useState } from "react";
import type { Message } from "../../types/message";
import './RoomPage.scss';
import { MessageList } from "../../components/MessageList/MessageList";
import type { Room } from "../../types/room";
import { sendMessage, ws } from "../../api/socket";


type Props = {
  name: string
}

export const RoomPage = ({ name }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [room, setRoom] = useState<Room>();
  const [isLoading, setIsLoading] = useState(true)
  const [draftNewMessage, setDraftNewMessage] = useState('')
  const { roomId } = useParams();
  const navigate = useNavigate();

  function handleSendMessage(draft: string) {
    const draftNorm = draft.trim();

    if (draftNorm.length < 1 || !roomId) {
      return;
    }

    sendMessage({
      type: 'message',
      roomId: roomId,
      author: name,
      content: draftNorm,
    })

  }

  useEffect(() => {

    function handleMessage(event: MessageEvent) {
      const { type, messages, message, room, rooms, error } = JSON.parse(event.data);

      if (type === 'message' && message.roomId === roomId) {
        setMessages((prevMessages) => [...prevMessages, message]);

        return;
      }

      if (type === 'roomJoined') {
        setRoom(room);
        setMessages(messages);
        setIsLoading(false);

        return;
      }

      if (type === 'roomRemoved') {
        navigate('/');

        return;
      }

      if (type === 'error') {
        alert(error)
        navigate('/');

        return;
      }

      if (type === 'rooms') {
        const updatedRoom = rooms.find((item: Room) => item.roomId === roomId)

        if (updatedRoom) {
          setRoom(updatedRoom);
        }
        return;
      }

    }

    ws.addEventListener('message', handleMessage);

    if (roomId) {
      sendMessage({ type: 'joinRoom', roomId })
    }

    return () => {
      ws.removeEventListener('message', handleMessage);
    }
  }, [roomId]);

  if (isLoading) {
    return <p className="roomPage__loading">Loading messages...</p>;
  }

  if (!room) {
    return <h5>Room not found</h5>
  }

  return (
    <div className="roomPage">
      <p className="roomPage__title">Room {room.name}</p>
      <Link className="roomPage__back" to='/'>Back to All Rooms</Link>

      <MessageList messages={messages} name={name} />

      <form className="form" onSubmit={(e) => {
        e.preventDefault()
        handleSendMessage(draftNewMessage)
        setDraftNewMessage('')
      }}>
        <input type="text"
          className="form__input"
          placeholder='Enter new message'
          value={draftNewMessage}
          onChange={(e) => {
            setDraftNewMessage(e.target.value)
          }} />
        <button className="form__button" type="submit" >
          Send
        </button>
      </form>
    </div>
  )
}
