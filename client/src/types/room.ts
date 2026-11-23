import type { User } from "./user";

export interface Room {
  id: string;
  name: string;
  owner: User;
  membersCount: number;
}
