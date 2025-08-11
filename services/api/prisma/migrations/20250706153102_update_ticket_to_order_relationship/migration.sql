/*
  Warnings:

  - You are about to drop the column `bookingId` on the `Ticket` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId]` on the `Ticket` table will be added. If there are existing duplicate values, this will fail.
*/

-- Step 1: Add the new orderId column (nullable initially)
ALTER TABLE `Ticket` ADD COLUMN `orderId` INTEGER NULL;

-- Step 2: Update existing tickets to link to their booking's order
UPDATE `Ticket` t
JOIN `Booking` b ON t.bookingId = b.id
SET t.orderId = b.orderId
WHERE t.orderId IS NULL;

-- Step 3: Drop the foreign key constraint
ALTER TABLE `Ticket` DROP FOREIGN KEY `Ticket_bookingId_fkey`;

-- Step 4: Drop the unique index on bookingId
DROP INDEX `Ticket_bookingId_key` ON `Ticket`;

-- Step 5: Make orderId NOT NULL
ALTER TABLE `Ticket` MODIFY COLUMN `orderId` INTEGER NOT NULL;

-- Step 6: Drop the old bookingId column
ALTER TABLE `Ticket` DROP COLUMN `bookingId`;

-- Step 7: Create unique index on orderId
CREATE UNIQUE INDEX `Ticket_orderId_key` ON `Ticket`(`orderId`);

-- Step 8: Add foreign key constraint for orderId
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
