-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('NORMAL', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ProfileRoles" AS ENUM ('CLIENT', 'OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserRoleStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('BI', 'NIF', 'CONTA_BANCARIA', 'PROFILE_PHOTO', 'CONTRATO_VENDA', 'CONTRATO_ARRENDAMENTO');

-- CreateEnum
CREATE TYPE "TypeProperties" AS ENUM ('APARTAMENTO', 'VIVENDA', 'ESCRITORIO', 'FAZENDA', 'TERRENO');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DISPONIVEL', 'RESERVADO', 'ALUGADO', 'VENDIDO', 'INATIVO');

-- CreateEnum
CREATE TYPE "MediaTypes" AS ENUM ('IMAGEM', 'VIDEO');

-- CreateEnum
CREATE TYPE "CompartmentsTypes" AS ENUM ('QUARTO', 'SALA_DE_ESTAR', 'SALA_DE_LAZER', 'ESCRITORIO', 'QUARTO_DE_BANHO', 'COZINHA', 'LAVANDARIA', 'GARAGEM');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_access" TIMESTAMP(3),
    "date_register" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "role" "ProfileRoles" NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "ProfileType" NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_profiles" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "full_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "person_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "legal_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_medias" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "type" "DocType" NOT NULL,
    "document_number" TEXT NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "inserted_in" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "profile_medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_roles" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "status" "UserRoleStatus" NOT NULL DEFAULT 'PENDING',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "profile_role_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "adminsName" TEXT NOT NULL,
    "access_level" "AccessLevel" NOT NULL DEFAULT 'NORMAL',
    "date_register" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emailVerification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "emailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" SERIAL NOT NULL,
    "id_owner" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type_of_property" "TypeProperties" NOT NULL,
    "description" TEXT NOT NULL,
    "status_property" "PropertyStatus" NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" INTEGER NOT NULL,
    "total_area" INTEGER,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyHistory" (
    "id" SERIAL NOT NULL,
    "id_owner" INTEGER NOT NULL,
    "id_property" INTEGER NOT NULL,
    "last_status" "PropertyStatus" NOT NULL,
    "new_status" "PropertyStatus" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "propertyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertiyMedia" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "type" "MediaTypes" NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "propertiyMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyLocalization" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "latitude" INTEGER NOT NULL,
    "longitude" INTEGER NOT NULL,
    "address_info" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,

    CONSTRAINT "propertyLocalization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyCompartments" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "CompartmentsTypes" NOT NULL,

    CONSTRAINT "propertyCompartments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_key" ON "roles"("role");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "person_profiles_profile_id_key" ON "person_profiles"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_profile_id_key" ON "company_profiles"("profile_id");

-- CreateIndex
CREATE INDEX "profile_medias_profile_id_type_idx" ON "profile_medias"("profile_id", "type");

-- CreateIndex
CREATE INDEX "profile_medias_profile_id_type_is_current_idx" ON "profile_medias"("profile_id", "type", "is_current");

-- CreateIndex
CREATE UNIQUE INDEX "profile_medias_type_document_number_key" ON "profile_medias"("type", "document_number");

-- CreateIndex
CREATE UNIQUE INDEX "profile_roles_profile_id_role_id_key" ON "profile_roles"("profile_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_profile_role_id_key" ON "admins"("profile_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_user_id_key" ON "admins"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "emailVerification_user_id_idx" ON "emailVerification"("user_id");

-- CreateIndex
CREATE INDEX "emailVerification_expires_at_idx" ON "emailVerification"("expires_at");

-- CreateIndex
CREATE INDEX "emailVerification_user_id_used_expires_at_idx" ON "emailVerification"("user_id", "used", "expires_at");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_profiles" ADD CONSTRAINT "person_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_medias" ADD CONSTRAINT "profile_medias_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_roles" ADD CONSTRAINT "profile_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_roles" ADD CONSTRAINT "profile_roles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_profile_role_id_fkey" FOREIGN KEY ("profile_role_id") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emailVerification" ADD CONSTRAINT "emailVerification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_id_owner_fkey" FOREIGN KEY ("id_owner") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyHistory" ADD CONSTRAINT "propertyHistory_id_owner_fkey" FOREIGN KEY ("id_owner") REFERENCES "profile_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyHistory" ADD CONSTRAINT "propertyHistory_id_property_fkey" FOREIGN KEY ("id_property") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertiyMedia" ADD CONSTRAINT "propertiyMedia_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyLocalization" ADD CONSTRAINT "propertyLocalization_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propertyCompartments" ADD CONSTRAINT "propertyCompartments_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
