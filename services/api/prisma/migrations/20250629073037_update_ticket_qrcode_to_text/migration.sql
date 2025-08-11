-- This is an empty migration.

-- Change qrCode column from VARCHAR to TEXT to support larger JSON data
ALTER TABLE `Ticket` MODIFY COLUMN `qrCode` TEXT;