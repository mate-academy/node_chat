export interface Room {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomsResponse {
  data: Room[];
  [key: string]: unknown;
}
