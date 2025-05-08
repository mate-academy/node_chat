import { Room } from '@prisma/client';

export type NormalizedRoom = Pick<Room, 'id' | 'name'>;
