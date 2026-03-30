-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetAnswerHash" TEXT,
ADD COLUMN     "resetQuestion" VARCHAR(200);
