-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "callingAnswers" TEXT,
ADD COLUMN     "joiningDate" TEXT,
ADD COLUMN     "offerDate" TEXT,
ADD COLUMN     "screeningNotes" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "designation" TEXT,
ADD COLUMN     "qualities" TEXT;
