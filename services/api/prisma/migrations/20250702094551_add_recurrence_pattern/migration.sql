-- AlterTable
ALTER TABLE `Schedule` ADD COLUMN `recurrencePatternId` INTEGER NULL;

-- CreateTable
CREATE TABLE `RecurrencePattern` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `routeId` INTEGER NOT NULL,
    `busId` INTEGER NOT NULL,
    `fare` DOUBLE NOT NULL,
    `isReturn` BOOLEAN NOT NULL DEFAULT false,
    `frequency` VARCHAR(191) NOT NULL,
    `days` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `createdBy` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_recurrencePatternId_fkey` FOREIGN KEY (`recurrencePatternId`) REFERENCES `RecurrencePattern`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
