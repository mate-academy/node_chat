/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `ChatProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `ChatProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChatProfile" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ChatProfile_email_key" ON "ChatProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ChatProfile_phone_key" ON "ChatProfile"("phone");
