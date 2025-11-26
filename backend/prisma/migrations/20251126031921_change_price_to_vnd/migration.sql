/*
  Warnings:

  - You are about to drop the column `priceCents` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `amountCents` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `priceVND` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountVND` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "priceCents",
ADD COLUMN     "priceVND" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "amountCents",
ADD COLUMN     "amountVND" INTEGER NOT NULL;
