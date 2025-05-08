import { NormalizedUser } from './NormalizedUser';
import { NormalizedMessage } from './NormalizedMessage';

export type RoomPreview = NormalizedUser & {
  creator: boolean;
  lastMessage: NormalizedMessage | null;
};
