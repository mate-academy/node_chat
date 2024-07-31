/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Message {
  id: string;
  userName: string;
  text: string;
  time: string;
  createdAt: string;
  updatedAt: string;
  roomId: string;
  userId: string;
}

export interface Room {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export enum Button { 
  Login = 'login',
  Logout = 'logout',
  Refresh = 'refresh',
  Create = 'create',
  Rename = 'rename',
  Delete = 'delete',
  Close = 'close',
  Send = 'send',
  Room = 'room',
}

export enum Input { 
  Login = 'login',
  RoomCreate = 'room-create',
  RoomRename = 'room-rename',
  Send = 'send',
}

export enum PlaceHolder { 
  Login = 'Введіть бажаний логін...',
  RoomCreate = 'Назва нового чата...',
  RoomRename = 'Введіть нову назву...',
  Send = 'Введіть повідомлення...',
}

export enum MessageParam { 
  Container = 'message__container',
  Position = 'message__position',
  Username = 'message__username',
  Text = 'message__text',
  Time = 'message__time',
}

export interface Request { 
  type: RequestType, 
  actions: RequestActions, 
  body?: RequestBody, 
  errorText: RequestError 
}

export enum RequestType { 
  FethRooms = 'FethRooms',
  Logout = 'Logout',
  Login = 'Login',
  RoomSelect = 'RoomSelect',
  RoomCreate = 'RoomCreate',
  RoomRename = 'RoomRename',
  RoomDelete = 'RoomDelete',
}

export interface RequestActions {
  onLogin?: (user: User) => void,
  onLogout?: () => void,
  setRooms?: (value: React.SetStateAction<Room[]>) => void,
  setNewRoomName?: (value: React.SetStateAction<string>) => void,
  setRoomIsChanging?: (value: React.SetStateAction<boolean>) => void,
  setRefresh?: (callback: (flag: boolean) => boolean) => void,
  setSelectedRoom?: (value: Room | null) => void,
  closeHelper?: () => void,
}

export interface RequestBody {
  user?: User | null,
  userId?: string,
  name?: string,
  id?: string,
  newName?: string,
}

export enum RequestError { 
  FethRooms = 'Load rooms from server failed!',
  Login = 'Login failed!',
  Logout = 'Logout failed!',
  RoomSelect = 'Select room failed!',
  RoomCreate = 'Create room failed!',
  RoomRename = 'Rename room failed!',
  RoomDelete = 'Delete room failed!',
}
