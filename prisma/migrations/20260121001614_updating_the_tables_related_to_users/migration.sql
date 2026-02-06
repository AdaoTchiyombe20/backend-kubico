/*
  Warnings:

  - You are about to drop the column `data_inicio` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `nivl_acesso` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_id` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `data_cadastro` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_papel_id` on the `client` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_papel_id` on the `owner` table. All the data in the column will be lost.
  - You are about to drop the `papel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuario_papel` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `admin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `access_level` to the `admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_register` to the `admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_register` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_role_id` to the `client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_role_id` to the `owner` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tipo` on the `owner` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('NORMAL', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('CLIENT', 'OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TypeOfOwner" AS ENUM ('PF', 'PJ');

-- DropForeignKey
ALTER TABLE "admin" DROP CONSTRAINT "admin_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "client" DROP CONSTRAINT "client_usuario_papel_id_fkey";

-- DropForeignKey
ALTER TABLE "owner" DROP CONSTRAINT "owner_usuario_papel_id_fkey";

-- DropForeignKey
ALTER TABLE "usuario_papel" DROP CONSTRAINT "usuario_papel_papel_id_fkey";

-- DropForeignKey
ALTER TABLE "usuario_papel" DROP CONSTRAINT "usuario_papel_usuario_id_fkey";

-- DropIndex
DROP INDEX "admin_usuario_id_key";

-- AlterTable
ALTER TABLE "admin" DROP COLUMN "data_inicio",
DROP COLUMN "nivl_acesso",
DROP COLUMN "usuario_id",
ADD COLUMN     "access_level" "AccessLevel" NOT NULL,
ADD COLUMN     "date_register" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "client" DROP COLUMN "data_cadastro",
DROP COLUMN "usuario_papel_id",
ADD COLUMN     "date_register" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_role_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "owner" DROP COLUMN "usuario_papel_id",
ADD COLUMN     "user_role_id" INTEGER NOT NULL,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "TypeOfOwner" NOT NULL;

-- DropTable
DROP TABLE "papel";

-- DropTable
DROP TABLE "usuario";

-- DropTable
DROP TABLE "usuario_papel";

-- DropEnum
DROP TYPE "NivelAcesso";

-- DropEnum
DROP TYPE "TipoProprietario";

-- DropEnum
DROP TYPE "UsuarioPapeis";

-- CreateTable
CREATE TABLE "role" (
    "id" SERIAL NOT NULL,
    "role" "UserRoles" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email_veryfied" BOOLEAN NOT NULL DEFAULT false,
    "last_access" TIMESTAMP(3),
    "date_register" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "admin_user_id_key" ON "admin"("user_id");

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_user_role_id_fkey" FOREIGN KEY ("user_role_id") REFERENCES "user_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner" ADD CONSTRAINT "owner_user_role_id_fkey" FOREIGN KEY ("user_role_id") REFERENCES "user_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
