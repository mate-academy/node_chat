export type Chat = {
  id: string;
  name: string;
  author: string;
  users: string[];
  messages: [
    {
      messageId: string;
      data: string;
    },
  ];
};