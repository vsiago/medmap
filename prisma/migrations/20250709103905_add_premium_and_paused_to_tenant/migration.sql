/*
  Warnings:

  - You are about to drop the column `operatorId` on the `Network` table. All the data in the column will be lost.
  - You are about to drop the `Operator` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `Network` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cnpj` to the `Tenant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Network" DROP CONSTRAINT "Network_operatorId_fkey";

-- DropForeignKey
ALTER TABLE "Operator" DROP CONSTRAINT "Operator_tenantId_fkey";

-- DropIndex
DROP INDEX "Network_operatorId_idx";

-- AlterTable
ALTER TABLE "Network" DROP COLUMN "operatorId",
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "address" TEXT,
ADD COLUMN     "addressComplement" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "cnpj" TEXT NOT NULL,
ADD COLUMN     "isPaused" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPremiumSubscriber" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- DropTable
DROP TABLE "Operator";

-- CreateIndex
CREATE INDEX "Network_tenantId_idx" ON "Network"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_cnpj_key" ON "Tenant"("cnpj");

-- AddForeignKey
ALTER TABLE "Network" ADD CONSTRAINT "Network_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
