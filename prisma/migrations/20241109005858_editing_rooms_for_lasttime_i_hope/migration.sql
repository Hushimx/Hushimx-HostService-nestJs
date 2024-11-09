/*
  Warnings:

  - The primary key for the `rooms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `rooms` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[uuid]` on the table `rooms` will be added. If there are existing duplicate values, this will fail.
  - The required column `uuid` was added to the `rooms` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_pkey",
ADD COLUMN     "uuid" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "rooms_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_uuid_key" ON "rooms"("uuid");
