/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Exam` table. All the data in the column will be lost.
  - Added the required column `clinicId` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filePath` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedById` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "fileUrl",
ADD COLUMN     "clinicId" INTEGER NOT NULL,
ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "uploadedById" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "RecordAccess" (
    "id" SERIAL NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "clinicId" INTEGER NOT NULL,

    CONSTRAINT "RecordAccess_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordAccess" ADD CONSTRAINT "RecordAccess_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordAccess" ADD CONSTRAINT "RecordAccess_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordAccess" ADD CONSTRAINT "RecordAccess_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
