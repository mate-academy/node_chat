import { useEffect, useState } from 'react'
import { Room } from '../types/room';

interface Data {
  rooms: Room[];
}


export const useData = () => {
  const [data, setData] = useState<Data>({
    rooms: [],
  });


  useEffect(() => {
    const socket = new WebSocket("ws://localhost:4000");

    socket.addEventListener("message", (event) => {
      setData(JSON.parse(event.data));
    });

    return () => {
      socket.close();
    }
  }, []);

  return {data}
}
