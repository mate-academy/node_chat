-- CreateEnum
CREATE TYPE "RoomVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "RoomMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED');

-- CreateTable
CREATE TABLE "ChatProfile" (
    "id" TEXT NOT NULL,
    "displayName" VARCHAR(50) NOT NULL,
    "avatarUrl" VARCHAR(2048),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ChatProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "visibility" "RoomVisibility" NOT NULL DEFAULT 'PUBLIC',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomMember" (
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "RoomMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "RoomMember_pkey" PRIMARY KEY ("roomId","userId")
);

-- CreateTable
CREATE TABLE "RoomInvitation" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "RoomInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "clientMessageId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorName" VARCHAR(50) NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_slug_key" ON "Room"("slug");

-- CreateIndex
CREATE INDEX "Room_ownerId_idx" ON "Room"("ownerId");

-- CreateIndex
CREATE INDEX "Room_visibility_deletedAt_idx" ON "Room"("visibility", "deletedAt");

-- CreateIndex
CREATE INDEX "RoomMember_userId_idx" ON "RoomMember"("userId");

-- CreateIndex
CREATE INDEX "RoomInvitation_recipientId_status_idx" ON "RoomInvitation"("recipientId", "status");

-- CreateIndex
CREATE INDEX "RoomInvitation_roomId_status_idx" ON "RoomInvitation"("roomId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RoomInvitation_roomId_recipientId_key" ON "RoomInvitation"("roomId", "recipientId");

-- CreateIndex
CREATE INDEX "Message_roomId_createdAt_id_idx" ON "Message"("roomId", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Message_authorId_clientMessageId_key" ON "Message"("authorId", "clientMessageId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "ChatProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMember" ADD CONSTRAINT "RoomMember_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMember" ADD CONSTRAINT "RoomMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ChatProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInvitation" ADD CONSTRAINT "RoomInvitation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInvitation" ADD CONSTRAINT "RoomInvitation_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "ChatProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInvitation" ADD CONSTRAINT "RoomInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "ChatProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "ChatProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
