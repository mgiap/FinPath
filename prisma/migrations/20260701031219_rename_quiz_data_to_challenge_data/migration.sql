/*
  Warnings:

  - The values [QUIZ] on the enum `LessonType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `quizData` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LessonType_new" AS ENUM ('ARTICLE', 'VIDEO', 'CHALLENGE', 'ASSIGNMENT');
ALTER TABLE "public"."Lesson" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Lesson" ALTER COLUMN "type" TYPE "LessonType_new" USING ("type"::text::"LessonType_new");
ALTER TYPE "LessonType" RENAME TO "LessonType_old";
ALTER TYPE "LessonType_new" RENAME TO "LessonType";
DROP TYPE "public"."LessonType_old";
ALTER TABLE "Lesson" ALTER COLUMN "type" SET DEFAULT 'ARTICLE';
COMMIT;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "quizData",
ADD COLUMN     "challengeData" JSONB;

-- AlterTable
ALTER TABLE "LessonProgress" ADD COLUMN     "firstAttemptScore" INTEGER;
