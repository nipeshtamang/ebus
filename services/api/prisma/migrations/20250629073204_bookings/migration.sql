/*
  Warnings:

  - Made the column `qrCode` on table `Ticket` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Ticket` MODIFY `qrCode` VARCHAR(191) NOT NULL;
