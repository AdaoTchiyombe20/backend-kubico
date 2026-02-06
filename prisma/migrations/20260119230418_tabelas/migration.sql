-- CreateEnum
CREATE TYPE "NivelAcesso" AS ENUM ('NORMAL', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "UsuarioPapeis" AS ENUM ('CLIENTE', 'PROPRIETARIO', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipoProprietario" AS ENUM ('PF', 'PJ');

-- CreateTable
CREATE TABLE "papel" (
    "id" SERIAL NOT NULL,
    "papel" "UsuarioPapeis" NOT NULL,
    "descricao" TEXT NOT NULL,

    CONSTRAINT "papel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "email_verificado" BOOLEAN NOT NULL DEFAULT false,
    "ultimoAcesso" TIMESTAMP(3),
    "dataCadastro" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_papel" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "papel_id" INTEGER NOT NULL,

    CONSTRAINT "usuario_papel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nivl_acesso" "NivelAcesso" NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client" (
    "id" SERIAL NOT NULL,
    "usuario_papel_id" INTEGER NOT NULL,
    "data_cadastro" TIMESTAMP(3) NOT NULL,
    "bi" TEXT NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner" (
    "id" SERIAL NOT NULL,
    "usuario_papel_id" INTEGER NOT NULL,
    "nif" TEXT NOT NULL,
    "tipo" "TipoProprietario" NOT NULL,
    "bi" TEXT,
    "data_cadastro" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_telefone_key" ON "usuario"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "admin_usuario_id_key" ON "admin"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "owner_nif_key" ON "owner"("nif");

-- AddForeignKey
ALTER TABLE "usuario_papel" ADD CONSTRAINT "usuario_papel_papel_id_fkey" FOREIGN KEY ("papel_id") REFERENCES "papel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_papel" ADD CONSTRAINT "usuario_papel_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario_papel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_usuario_papel_id_fkey" FOREIGN KEY ("usuario_papel_id") REFERENCES "usuario_papel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owner" ADD CONSTRAINT "owner_usuario_papel_id_fkey" FOREIGN KEY ("usuario_papel_id") REFERENCES "usuario_papel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
