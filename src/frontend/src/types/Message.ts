export type Message = {
  user: string;
  text: string;
  createdAt: Date;
  id: number;
  type: 'user' | 'system';
};
