/*
  Warnings:

  - Added the required column `first` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "first" TEXT NOT NULL,
ADD COLUMN     "lastname" TEXT NOT NULL;
