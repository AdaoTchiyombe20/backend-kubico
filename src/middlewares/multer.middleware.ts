import multer from "multer";
import type { Request } from "express";
import { AppError } from "../errors/App.Errors.js";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import crypto from "crypto";

// ─── Garantir diretório temporário ───────────────────────────────────────────
/* fs.mkdirSync("uploads/tmp", { recursive: true }); */

const MB = 1024 * 1024;

const LIMITS = {
  image: 5 * MB,
  document: 10 * MB,
  video: 500 * MB,
};

const ALLOWED_DOCUMENT_FIELDS = new Set([
  "profile_photo",
  "contrato_venda",
  "contrato_arrendamento",
]);

const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);
const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/mkv",
  "video/mov",
  "video/avi",
  "video/webm",
]);
const PDF_MIME_TYPE = "application/pdf";

const isPdf = (mime: string) => mime === PDF_MIME_TYPE;
const isImage = (mime: string) => IMAGE_MIME_TYPES.has(mime);
const isVideo = (mime: string) => VIDEO_MIME_TYPES.has(mime);

// ─── Disk storage único para todos ───────────────────────────────────────────
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/tmp"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

// ─── Buffer para todos ───────────────────────────────────────────
const bufferStorage = multer.memoryStorage();

// ✅ Função importada do cloudinary.utils foi removida (usar a do utils!)
// Veja: src/utils/cloudinary.utils.ts
export { deleteTempFile } from "../utils/cloudinary.utils.js";

// ─── File filters ─────────────────────────────────────────────────────────────
const profileFileFilter = (_req: Request, file: Express.Multer.File, cb: any) => {
  if (!ALLOWED_DOCUMENT_FIELDS.has(file.fieldname))
    return cb(new AppError(`Campo inválido: "${file.fieldname}"`, 400));
  if (isPdf(file.mimetype) || isImage(file.mimetype)) return cb(null, true);
  cb(new AppError(`Tipo de ficheiro inválido: "${file.mimetype}"`, 400));
};

const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: any) => {
  if (isImage(file.mimetype)) return cb(null, true);
  cb(new AppError("Apenas imagens são permitidas (png, jpeg, webp)", 400));
};

const docFileFilter = (_req: Request, file: Express.Multer.File, cb: any) => {
  if (isPdf(file.mimetype)) return cb(null, true);
  cb(new AppError("Apenas ficheiros PDF são permitidos", 400));
};

const videoFileFilter = (_req: Request, file: Express.Multer.File, cb: any) => {
  if (isVideo(file.mimetype)) return cb(null, true);
  cb(new AppError("Apenas vídeos são permitidos (mp4, mkv, mov, avi, webm)", 400));
};

const imageOrVideoFilter = (_req: Request, file: Express.Multer.File, cb: any) => {
  if (isImage(file.mimetype) || isVideo(file.mimetype)) return cb(null, true);
  cb(new AppError("Apenas imagens ou vídeos são permitidos", 400));
};

// ─── Multer exports ───────────────────────────────────────────────────────────
export const multerUploads = {
  uploadFilesFromProfile: multer({
    storage: diskStorage,
    limits: { fileSize: LIMITS.document },
    fileFilter: profileFileFilter,
  }),

  uploadImg: multer({
    storage: diskStorage,
    limits: { fileSize: LIMITS.image },
    fileFilter: imageFileFilter,
  }),

  uploadDoc: multer({
    storage: diskStorage,
    limits: { fileSize: LIMITS.document },
    fileFilter: docFileFilter,
  }),

  uploadVideo: multer({
    storage: diskStorage,
    limits: { fileSize: LIMITS.video },
    fileFilter: videoFileFilter,
  }),

  uploadImagesAndVideo: multer({
    storage: diskStorage,
    limits: { fileSize: LIMITS.video },
    fileFilter: imageOrVideoFilter,
  }),
};