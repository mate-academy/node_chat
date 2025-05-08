import { Message } from '@prisma/client';

export type NormalizedMessage = Pick<Message, 'id' | 'text'> & { time: Date };
