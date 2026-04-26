-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthday" TIMESTAMP(3),
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profilePictureUrl" TEXT,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "ExerciseResult" ADD COLUMN     "concerns" TEXT,
ADD COLUMN     "notes" TEXT;
