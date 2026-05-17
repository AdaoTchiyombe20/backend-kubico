/**
 * Utilitários para gerenciamento de uploads no Cloudinary
 * Responsabilidade: Upload, cleanup e deleção de ficheiros
 */

import type { Express } from "express";
import { AppError } from "../errors/App.Errors.js";
import fs from "fs";
import fsPromises from "fs/promises";
import cloudinary from "../config/cloudinary.js";
import pLimit from "p-limit";

// ─── Tipos ──────────────────────────────────────────────────────────────────
type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  resource_type: string;
  bytes: number;
  format: string;
};

export type UploadedMediaFile = {
  fieldname: string;
  url: string;
  public_id: string;
  mediaType: "IMAGEM" | "VIDEO";
};

export type UploadResults = {
  uploadedFiles: UploadedMediaFile[];
  errors: string[];
};

// ─── Config ─────────────────────────────────────────────────────────────────
const limiter = pLimit(3); // Limita a 3 uploads simultâneos

const MB = 1024 * 1024;
const CLOUDINARY_CHUNK_SIZE = 10 * MB;

// ─── Resolutores de Tipo ────────────────────────────────────────────────────
/**
 * Determina o tipo de recurso Cloudinary baseado no MIME type
 */
export const resolveResourceType = (mimetype: string): "image" | "video" => {
  if (mimetype.startsWith("image/")) return "image";
  return "video";
};

/**
 * Determina o tipo de media (IMAGEM | VIDEO) baseado no MIME type
 */
export const resolveMediaType = (mimetype: string): "IMAGEM" | "VIDEO" => {
  if (mimetype.startsWith("image/")) return "IMAGEM";
  return "VIDEO";
};

// ─── Upload para Cloudinary ─────────────────────────────────────────────────
/**
 * Faz upload de um ficheiro para Cloudinary via stream
 * @param filePath - Caminho do ficheiro temporário
 * @param folder - Pasta no Cloudinary (ex: "properties/123")
 * @param resourceType - Tipo de recurso ("image" ou "video")
 * @returns Promise com resultado do upload (public_id, secure_url, etc)
 */
export const uploadToCloudinary = async (
  filePath: string,
  folder: string,
  resourceType: "image" | "video" = "image",
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        ...(resourceType === "video" && { chunk_size: CLOUDINARY_CHUNK_SIZE }),
      },
      (error: any, result: any) => {
        if (error) {
          return reject(
            new AppError(`Erro ao fazer upload para Cloudinary: ${error.message}`, 500)
          );
        }
        resolve(result as CloudinaryUploadResult);
      },
    );
    fs.createReadStream(filePath).pipe(uploadStream);
  });
};

/**
 * Deleta um ficheiro do Cloudinary
 * @param publicId - ID público do ficheiro no Cloudinary
 * @param resourceType - Tipo de recurso ("image" ou "video")
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" = "image",
): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`Erro ao deletar ${publicId} do Cloudinary:`, error);
    throw new AppError(
      `Erro ao deletar ficheiro do Cloudinary: ${error instanceof Error ? error.message : String(error)}`,
      500
    );
  }
};

// ─── Gerenciamento de Ficheiros Temporários ──────────────────────────────────
/**
 * Deleta um ficheiro temporário do sistema de ficheiros
 * @param filePath - Caminho do ficheiro
 */
export const deleteTempFile = async (filePath: string): Promise<void> => {
  try {
    await fsPromises.unlink(filePath);
  } catch (error) {
    // Ficheiro já apagado ou não encontrado — ignorar silenciosamente
    console.debug(`Ficheiro temporário não encontrado ou já apagado: ${filePath}`);
  }
};

/**
 * Deleta múltiplos ficheiros temporários
 * @param files - Objeto com estrutura de multer { [fieldname]: File[] }
 */
export const deleteTempFiles = async (files: {
  [fieldName: string]: Express.Multer.File[];
}): Promise<void> => {
  const allFiles = Object.values(files).flat();

  const deleteResults = await Promise.allSettled(
    allFiles.map((file) => deleteTempFile(file.path))
  );

  const deleteFailed = deleteResults.filter((r) => r.status === "rejected");
  if (deleteFailed.length > 0) {
    console.warn(
      `⚠️ Falha ao deletar ${deleteFailed.length} ficheiro(s) temporário(s)`
    );
    // Não falha a operação — ficheiros temp não afetam a lógica
  }
};

// ─── Upload para Cloudinary (com tratamento de erros) ────────────────────────
/**
 * Faz upload de múltiplos ficheiros para Cloudinary
 * Retorna lista de sucessos e lista de erros
 * @param files - Objeto com estrutura de multer { [fieldname]: File[] }
 * @param folderPrefix - Prefixo da pasta no Cloudinary (ex: "properties")
 * @returns Promise com uploadedFiles e errors
 */
export const uploadFilesToCloudinary = async (
  files: { [fieldName: string]: Express.Multer.File[] },
  folderPrefix: string = "properties"
): Promise<UploadResults> => {
  const allFiles = Object.entries(files).flatMap(([fieldname, fieldFiles]) =>
    fieldFiles.map((file) => ({ fieldname, file }))
  );

  const uploadedFiles: UploadedMediaFile[] = [];
  const errors: string[] = [];

  const results = await Promise.allSettled(
    allFiles.map(({ fieldname, file }) =>
      limiter(async () => {
        try {
          const resourceType = resolveResourceType(file.mimetype);
          const mediaType = resolveMediaType(file.mimetype);

          const result = await uploadToCloudinary(
            file.path,
            `${folderPrefix}/${Date.now()}`, // Usar temp folder com timestamp
            resourceType
          );

          return {
            fieldname,
            url: result.secure_url,
            public_id: result.public_id,
            mediaType,
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Erro ao enviar "${fieldname}": ${message}`);
        }
      })
    )
  );

  // Processar resultados do Promise.allSettled
  for (const result of results) {
    if (result.status === "fulfilled") {
      uploadedFiles.push(result.value);
    } else {
      const message =
        result.reason instanceof Error ? result.reason.message : String(result.reason);
      errors.push(message);
    }
  }

  return { uploadedFiles, errors };
};

// ─── Cleanup do Cloudinary ──────────────────────────────────────────────────
/**
 * Deleta múltiplos ficheiros do Cloudinary (cleanup em caso de falha)
 * Usa Promise.allSettled para não falhar se algum delete falhar
 * @param uploadedFiles - Lista de ficheiros uploadados
 */
export const cleanupCloudinaryFiles = async (
  uploadedFiles: UploadedMediaFile[]
): Promise<void> => {
  if (uploadedFiles.length === 0) return;

  const deleteResults = await Promise.allSettled(
    uploadedFiles.map((media) =>
      deleteFromCloudinary(
        media.public_id,
        media.mediaType === "VIDEO" ? "video" : "image"
      )
    )
  );

  const deleteFailed = deleteResults.filter((r) => r.status === "rejected");
  if (deleteFailed.length > 0) {
    console.error(
      `⚠️ Falha ao deletar ${deleteFailed.length} ficheiro(s) do Cloudinary durante cleanup`,
      deleteFailed.map((r) => (r.status === "rejected" ? r.reason : ""))
    );
    // Log mas não falha — já estamos em recovery mode
  }
};