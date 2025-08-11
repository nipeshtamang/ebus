/*
  Warnings:

  - The values [MANUAL] on the enum `Payment_method` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Payment` MODIFY `method` ENUM('ESEWA', 'KHALTI', 'IPS_CONNECT', 'BANK', 'CASH') NOT NULL;
