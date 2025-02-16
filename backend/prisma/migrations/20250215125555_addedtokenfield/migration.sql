-- AlterTable
ALTER TABLE "User" ADD COLUMN     "parentAuthExpiresAt" TIMESTAMP(3),
ADD COLUMN     "parentAuthToken" TEXT;
