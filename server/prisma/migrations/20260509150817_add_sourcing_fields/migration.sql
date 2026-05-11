-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "channels" TEXT,
ADD COLUMN     "periodOfPost" TEXT,
ADD COLUMN     "priority" TEXT DEFAULT 'Moderate',
ADD COLUMN     "projectCode" TEXT,
ADD COLUMN     "recruiter" TEXT;
