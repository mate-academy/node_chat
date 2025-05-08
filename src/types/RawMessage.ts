import { User, Message } from '@prisma/client';

export type RawMessage = Message & { author: User };
