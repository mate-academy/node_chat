import { Navigate, Outlet } from "react-router"
import { useAuth } from "../components/AuthProvider.tsx"
import { RoomList } from "../components/RoomList.tsx";
import { useState,useEffect } from 'react';
import { roomService } from "../services/roomService.ts";
import { socket } from "../socket.ts";




export const Rooms = () => {
  const [text, setText] = useState('');
  const[rooms,setRooms]= useState([])
  const {  currentUser,logout } = useAuth();

   useEffect(() => {
    const fetchAll = async () => {
      const allRooms = await roomService.getAll();
      setRooms(allRooms);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    socket.on('room:created', (newRoom,) => {
      setRooms(prev => {

        if (prev.some(room => room.id === newRoom.id)) return prev;
        return [...prev, newRoom];
      });
    });

    return () => socket.off('room:created');
  }, []);

  useEffect(() => {
  const handleRename = ({ id, name }) => {
    setRooms(prev =>
      prev.map(room =>
        room.id === id ? { ...room, name } : room
      )
    );
  };

  socket.on('roomRenamed', handleRename);

  return () => socket.off('roomRenamed', handleRename);
}, []);


  useEffect(() => {
    const handleDelete = ({ id }) => {
     setRooms(prev=>prev.filter(room=>room.id!==id))
    }
    socket.on('roomDeleted', handleDelete);

return ()=>socket.off('roomDeleted',handleDelete)  }, [])

  if (!currentUser) {
    return <Navigate to={"/"}/>
  }

  const handleSubmit = async (event) => {

        event.preventDefault();
     await roomService.createRoom(text, currentUser.id)

        setText('');

 }


  const myRooms = rooms.filter(room=>room.userId===currentUser.id)
  const anotherRooms = rooms.filter(room=>room.userId!==currentUser.id)

  return (<><button className="button"
    onClick={logout}> LogOut</button>
    <h1>{`Hello ${currentUser.name}! choose a room based on your interests, or create your own`}</h1>


     <form
      className="field is-horizontal"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        className="input"
        placeholder="Enter a room name"
        value={text}
        onChange={event => setText(event.target.value)}
      />
      <button className="button"
      disabled = {text.length=== 0}>CreateRoom</button>
    </form>




    {rooms.length > 0 ? <RoomList

      myRooms={myRooms}
      antRooms={anotherRooms}
    />:<h1>There are no rooms, please create a new one.</h1>}
      <Outlet />
  </>)
}
