import { v7 as uuid7 } from 'uuid';

export const systemMessage = (text) => {
  const id = uuid7();
  const message = {
    id,
    text,
    createAt: new Date(),
    type: 'system',
  };

  return message;
};
