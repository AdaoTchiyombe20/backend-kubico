/*
  Warnings:

  - You are about to drop the column `userId` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `owner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_role` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_role_id` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "admin" DROP CONSTRAINT "admin_user_id_fkey";

-- DropForeignKey
ALTER TABLE "client" DROP CONSTRAINT "client_user_role_id_fkey";

-- DropForeignKey
ALTER TABLE "owner" DROP CONSTRAINT "owner_user_role_id_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_role" DROP CONSTRAINT "user_role_user_id_fkey";

-- DropIndex
DROP INDEX "refresh_tokens_userId_idx";

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "userId",
ADD COLUMN     "user_role_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "admin";

-- DropTable
DROP TABLE "client";

-- DropTable
DROP TABLE "owner";

-- DropTable
DROP TABLE "role";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "user_role";

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "role" "UserRoles" NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_access" TIMESTAMP(3),
    "date_register" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "user_role_id" INTEGER NOT NULL,
    "access_level" "AccessLevel" NOT NULL DEFAULT 'NORMAL',
    "date_register" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "user_role_id" INTEGER NOT NULL,
    "date_register" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bi" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owners" (
    "id" SERIAL NOT NULL,
    "user_role_id" INTEGER NOT NULL,
    "nif" TEXT NOT NULL,
    "tipo" "TypeOfOwner" NOT NULL,
    "bi" TEXT,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_key" ON "roles"("role");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_user_role_id_key" ON "admins"("user_role_id");

-- CreateIndex
CREATE INDEX "admins_user_role_id_idx" ON "admins"("user_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_user_role_id_key" ON "clients"("user_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_bi_key" ON "clients"("bi");

-- CreateIndex
CREATE INDEX "clients_user_role_id_idx" ON "clients"("user_role_id");

-- CreateIndex
CREATE INDEX "clients_bi_idx" ON "clients"("bi");

-- CreateIndex
CREATE UNIQUE INDEX "owners_user_role_id_key" ON "owners"("user_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "owners_nif_key" ON "owners"("nif");

-- CreateIndex
CREATE UNIQUE INDEX "owners_bi_key" ON "owners"("bi");

-- CreateIndex
CREATE INDEX "owners_user_role_id_idx" ON "owners"("user_role_id");

-- CreateIndex
CREATE INDEX "owners_nif_idx" ON "owners"("nif");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_role_id_idx" ON "refresh_tokens"("user_role_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_role_id_fkey" FOREIGN KEY ("user_role_id") REFERENCES "user_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_role_id_fkey" FOREIGN KEY ("user_role_id") REFERENCES "user_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owners" ADD CONSTRAINT "owners_user_role_id_fkey" FOREIGN KEY ("user_role_id") REFERENCES "user_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_role_id_fkey" FOREIGN KEY ("user_role_id") REFERENCES "user_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
