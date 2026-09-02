export type ChatProfile = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  identifier?: string;
};

export type RoomMember = {
  roomId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  lastReadAt: string | null;
};

export type ChatRoom = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  members: RoomMember[];
  _count: {
    members: number;
  };
};

export type ChatMessage = {
  id: string;
  clientMessageId: string;
  roomId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  deletedAt: string | null;
};

export type ChatProfileSummary = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
};

export type RoomInvitation = {
  id: string;
  roomId: string;
  recipientId: string;
  invitedById: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED';
  createdAt: string;
  respondedAt: string | null;
  expiresAt: string | null;
  room: ChatRoom;
  invitedBy: ChatProfileSummary;
};

export type RoomMemberDetails = RoomMember & {
  user: ChatProfile;
};

export type ChatRoomDetails = Omit<ChatRoom, 'members' | '_count'> & {
  members: RoomMemberDetails[];
};
export type MessagesPage = {
  items: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
};
