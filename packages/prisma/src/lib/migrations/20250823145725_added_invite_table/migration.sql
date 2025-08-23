/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `Studio` will be added. If there are existing duplicate values, this will fail.
  - The required column `inviteCode` was added to the `Studio` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "public"."Studio" ADD COLUMN     "inviteCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Studio_inviteCode_key" ON "public"."Studio"("inviteCode");
