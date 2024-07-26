export interface Room {
  id: string;
  name: string;
  createByUserId: string;
}

export interface CreateRoomDto extends Omit<Room, 'id'> {}

export interface CreateRoomDtoUpdate extends Omit<Room, 'createByUserId'> {}
