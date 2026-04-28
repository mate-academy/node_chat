export type Message = { username: string; text: string; time: Date; roomId: string };
export type Room = { name: string; messages: Message[] };
