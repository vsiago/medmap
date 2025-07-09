/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `Operator` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `color` to the `Operator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logo` to the `Operator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Operator" ADD COLUMN     "address" TEXT,
ADD COLUMN     "addressComplement" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "logo" TEXT NOT NULL,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Operator_cnpj_key" ON "Operator"("cnpj");
