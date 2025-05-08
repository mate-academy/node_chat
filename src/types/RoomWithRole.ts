import { RoomPreview } from './RoomPreview';

export type RoomWithRole = Omit<RoomPreview, 'lastMessage'>;
