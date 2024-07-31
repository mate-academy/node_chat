/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-case-declarations */
import axios from "axios";
import { Request, RequestType, Room } from "../types/types";
import { API_URL } from "../constants/constants";

export const getMessageTime = (date: string) =>
  new Date(date).toLocaleTimeString('uk-UA', {
    hour: '2-digit', minute: '2-digit',
  });

export const getSortedRooms = (rooms: Room[]) => rooms.sort((room1, room2) => {
  return new Date(room2.createdAt).getTime() - new Date(room1.createdAt).getTime();
});

export const requestCreator = async (request: Request) => {
  const { type, actions, body, errorText } = request;
  const {
    onLogin = () => { },
    onLogout = () => { },
    setNewRoomName = () => { },
    setRooms = () => { },
    setRoomIsChanging = () => { },
    setRefresh = () => { },
    closeHelper = () => { },
    setSelectedRoom = () => { },
  } = actions;

  try {
    switch (type) {
      case RequestType.FethRooms:
        const { data: rooms } = await axios.get(`${API_URL}room/chatRooms`);
        setRooms(getSortedRooms(rooms as Room[]));
        break;
      case RequestType.Login:
        const { data } = await axios.post(`${API_URL}user/login`, body);
        onLogin(data);
        localStorage.setItem('author', JSON.stringify(data));
        break;
      case RequestType.Logout:
        await axios.post(`${API_URL}user/logout`, body);
        onLogout();
        localStorage.removeItem('author');
        break;
      case RequestType.RoomSelect:
        const { data: selectedRoom } = await axios.get(`${API_URL}room/getRoom/${body?.id}`);
        setSelectedRoom(selectedRoom as Room);
        break;
      case RequestType.RoomCreate:
        const { data: newRoom } = await axios.post(`${API_URL}room/createRoom`, body);
        setRooms(currentRooms => [newRoom, ...currentRooms]);
        setNewRoomName('');
        break;
      case RequestType.RoomRename:
        await axios.post(`${API_URL}room/editRoom`, body);
        setRoomIsChanging(false);
        setRefresh(prevRefresh => !prevRefresh);
        break;
      case RequestType.RoomDelete:
        await axios.post(`${API_URL}room/deleteRoom`, body);
        setRooms(allRooms => allRooms.filter(room => room.id !== body?.id));
        closeHelper();
        break;
    }
  } catch (error) {
    console.error(errorText, error);
  } finally {
    if (type === RequestType.RoomSelect) {
      setRefresh(currentRefresh => !currentRefresh);
    }
  }
};

