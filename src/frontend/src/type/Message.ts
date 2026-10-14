/* eslint-disable */
export type Message = {
  id: string;
  user: string;
  text: string;
  createAt: Date;
  type: 'user' | 'system';
};
