-- This is an empty migration.

-- Change profileImage column from VARCHAR to TEXT to support larger base64 images
ALTER TABLE `User` MODIFY COLUMN `profileImage` TEXT;