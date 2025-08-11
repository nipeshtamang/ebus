/*
  Warnings:

  - You are about to drop the column `recurrencePatternId` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the `RecurrencePattern` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Schedule` DROP FOREIGN KEY `Schedule_recurrencePatternId_fkey`;

-- AlterTable
ALTER TABLE `Schedule` DROP COLUMN `recurrencePatternId`;

-- DropTable
DROP TABLE `RecurrencePattern`;
