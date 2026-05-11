import { AppError } from "../errors/App.Errors.js";
import { uploadToCloudinary, deleteTempFile } from "../middlewares/multer.middleware.js";

type MulterFiles =
  | { [fieldname: string]: Express.Multer.File[] }
  | Express.Multer.File[]
  | undefined;

type UploadedFile = {
  fieldname: string;
  public_id: string;
  secure_url: string;
};

export const uploadFiles = async (
  files: MulterFiles,
  folder: string
): Promise<UploadedFile[]> => {
  if (!files) throw new AppError("Nenhum ficheiro inserido", 400);

  const fileArray = Array.isArray(files) ? files : Object.values(files).flat();

  const results = await Promise.all(
    fileArray.map(async (file) => {
      const resourceType =
        file.mimetype.startsWith("video/") ? "video"
        : file.mimetype === "application/pdf" ? "raw"
        : "image";

      try {
        const data = await uploadToCloudinary(file.path, folder, resourceType);

        return {
          fieldname: file.fieldname,
          public_id: data.public_id,
          secure_url: data.secure_url,
        };
      } finally {
        await deleteTempFile(file.path).catch(() => {});
      }
    })
  );

  return results;
};
