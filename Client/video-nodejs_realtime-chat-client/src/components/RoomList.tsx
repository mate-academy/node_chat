
import { useNavigate, useParams } from 'react-router';
import { roomService } from '../services/roomService.ts';

import './RoomList.scss'
import {useState} from 'react'
import { socket } from '../socket.ts';
import { useAuth } from './AuthProvider.tsx';
export const RoomList = ({ myRooms,  antRooms }) => {
  const {  currentUser } = useAuth();
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previousRoomId, setPreviousRoomId] = useState<string | null>(null);

  
 const {roomId}=useParams()
  
  const renameRoom = async (event) => {
      try {
    await roomService.renameRoom(editingId, input, currentUser.id);  
    setEditingId(null);
    setInput('');  
  } catch (error) {
    console.error(error);
    
  } 
  }
  const deleteRoom = async (roomId:string) => {
    try {
      
      await roomService.deleteRoom(roomId, currentUser.id)
      navigate('/rooms');
      
    } catch (error) {
      console.error(error)
    }
  }
  const navigate = useNavigate()
 const openRoom = (roomId: string) => {
  
  if (previousRoomId) {
    socket.emit("leaveRoom", previousRoomId);
  }

  socket.emit("joinRoom", roomId); 
  setPreviousRoomId(roomId);
  navigate(`/rooms/${roomId}`);
}

  
 return (<> <div className = 'box'>
 { myRooms.length>0 && <div className = 'position'>
    <h1>My Rooms:</h1>
    <ul className="roomsBox">
      {myRooms.map(room => (
        <li className="roomsItem" key={room.id}
          
         >  
          {editingId !== room.id ? (
            <><span
            className="roomName"
            onClick={() => {
              setInput('')
              setEditingId(room.id)
              }}>{room.name}</span>
<div>
            <button  className={`roomsVisite ${
    room.id === Number(roomId) ? 'active' : ''
  }`}
                onClick={() => {openRoom(room.id)              
                }
            }>VisiteRoom</button>
             <button className="roomsDelete "
                onClick={() => {deleteRoom(room.id)
                  
                 
                }
            }>deleteRoom</button>
              </div></>) :
            (<input 
              value={input}  
              onChange={(event) => {

              setInput(event.target.value)
              }} /> 
            )
          }
         
          
          {editingId === room.id && <div className="roomActions">
            <button className="roomsButton back"
              onClick={() => {
                setEditingId(null)
                setInput('')
              }
            }>X</button>
            <button className="roomsButton edit"
              onClick={renameRoom}
             disabled ={input.trim().length===0}
            >Rename✎</button>
           
          </div>}
        </li>
      ))}
    </ul>
   </div>}
   
   {antRooms.length>0 && <div>
   
     <h1>quest rooms:</h1>
    <ul className="roomsBox">
      {antRooms.map(room => (
        <li className="roomsItem" key={room.id}>  
          <span className="roomName">{room.name}</span>
         <button
  className={`roomsVisite ${
    room.id === Number(roomId) ? 'active' : ''
  }`}
  onClick={() => openRoom(room.id)}
>VisiteRoom</button>
        </li>
      ))}
    </ul>
   </div>}
 </div></>
);

  
}