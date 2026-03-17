import { AppError } from "../errors/App.Errors.js";
import { profileRole } from "../repositories/userProfile/profileRole.repositories.js";
import { person_profilesRepository } from "../repositories/userProfile/personProfiles.repositories.js";
import { profileMediaRepository } from "../repositories/userProfile/profileMedia.repositories.js";
import { companyProfileRepository } from "../repositories/userProfile/companyProfile.repositories.js";
import { DocType } from "../../generated/prisma/index.js";
import { profileRepository } from "../repositories/userProfile/profile.repositories.js";
import { uploadToCloudinary, deleteTempFile } from "../middlewares/multer.middleware.js";
import { threadCpuUsage } from "process";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type MulterFiles =
  | { [fieldname: string]: Express.Multer.File[] }
  | Express.Multer.File[]
  | undefined;

type UploadedFile = {
  fieldname: string;
  public_id: string;
  secure_url: string;
};

// ─── Docs permitidos por perfil ───────────────────────────────────────────────
const BASE_INDIVIDUAL_DOCS: DocType[] = [
  "BI",
  "NIF",
  "SELFIE_WITH_BI",
  "COMPROVANTE_RESIDENCIA",
];

const INDIVIDUAL_OWNER_EXTRA_DOCS: DocType[] = [
  "CERTIDAO_PREDIAL",
  "CADERNETA_PREDIAL",
  "LICENCA_UTILIZACAO",
  "CERTIDAO_NEGATIVA_ONUS",
];

const INDIVIDUAL_OWNER_DOCS: DocType[] = [
  ...BASE_INDIVIDUAL_DOCS,
  ...INDIVIDUAL_OWNER_EXTRA_DOCS,
];

const COMPANY_CLIENT_DOCS: DocType[] = [
  "BI_REPRESENTANTE",
  "NIF",
  "CERTIDAO_COMERCIAL",
  "COMPROVANTE_RESIDENCIA",
];

const COMPANY_OWNER_DOCS: DocType[] = [
  "BI_REPRESENTANTE",
  "CERTIDAO_COMERCIAL",
  "DOC_COMPROVANTE_REPRESENTANTE_LEGAL_EMPRESA",
  "COMPROVATIVO_TITULARIDADE_CONTA_BANCARIA",
];

// ─── Utilitários ──────────────────────────────────────────────────────────────
const uploadFiles = async (
  files: MulterFiles,
  folder: string
): Promise<UploadedFile[]> => {
  if (!files) throw new AppError("Nenhum ficheiro inserido", 400);

  const fileArray = Array.isArray(files)
    ? files
    : Object.values(files).flat();

  if (fileArray.length === 0) throw new AppError("Nenhum ficheiro inserido", 400);

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

const getUrl = (uploaded: UploadedFile[], fieldname: string): string =>
  uploaded.find((f) => f.fieldname === fieldname)?.secure_url ?? "";

const getPublicId = (uploaded: UploadedFile[], fieldname: string): string =>
  uploaded.find((f) => f.fieldname === fieldname)?.public_id ?? "";

// ─── Service ──────────────────────────────────────────────────────────────────
export const profileService = {
  createClientIndividual: async (
    user_id: number,
    data: {
      full_name: string;
      birth_date: Date;
      phone: string;
      bi: string;
    },
    files: MulterFiles
  ) => {
    
    const existingProfile = await profileRepository.findByUserId(user_id)
    
    if(!existingProfile) throw new AppError('Profile inexistente!', 400)
      
    const {id: profile_id} = existingProfile
    const {full_name, birth_date, phone, bi} = data  
      const existingPerson = await person_profilesRepository.findById(profile_id);
      if (!existingPerson) {
        await person_profilesRepository.createBase(profile_id,{full_name, birth_date, phone});
      }
      else{
        throw new AppError('usuario ja existente',400)
      }
      
    const existingRole = await profileRole.findProfileRoleByRole(profile_id, 1);
    if (existingRole) throw new AppError("Cliente já existe", 400);
    
    const uploaded = await uploadFiles(files, "profiles/individual-client");
      
    await profileMediaRepository.upsertDocuments(
      profile_id,
      [
        {
          type: "BI",
          url: getUrl(uploaded, "bi"),
          public_id: getPublicId(uploaded, "bi"),
          document_number: bi,
        },
        {
          type: "SELFIE_WITH_BI",
          url: getUrl(uploaded, "selfie_with_bi"),
          public_id: getPublicId(uploaded, "selfie_with_bi"),
        },
      ],
      BASE_INDIVIDUAL_DOCS
    );

    await profileRole.updateAllProfileRolesStatus(profile_id, false);
    await profileRole.insertValues(profile_id, 1, "PENDING");
  },

  createClientCompany: async (
    user_id: number,
    data: {
      legal_name: string;
      phone: string;
      nif: string;
      nameOfLegalRepresentative: string;
    },
    files: MulterFiles
  ) => {
    const uploaded = await uploadFiles(files, "profiles/company-client");

    const existingProfile = await profileRepository.findByUserId(user_id)
    
    if(!existingProfile) throw new AppError('Profile inexistente!', 400)
    
    const {id: profile_id} = existingProfile

    const existingCompany = await companyProfileRepository.findById(profile_id);
    if (!existingCompany){
      await companyProfileRepository.createBase(profile_id, data);
    }else{
      throw new AppError('Empresa ja existente', 400)
    }
    
    const existingRole = await profileRole.findProfileRoleByRole(profile_id, 1);

    if (existingRole) throw new AppError("Cliente já existe", 400);

    await profileMediaRepository.upsertDocuments(
      profile_id,
      [
        {
          type: "BI_REPRESENTANTE",
          url: getUrl(uploaded, "bi_representante"),
          public_id: getPublicId(uploaded, "bi_representante"),
        },
        {
          type: "CERTIDAO_COMERCIAL",
          url: getUrl(uploaded, "certidao_comercial"),
          public_id: getPublicId(uploaded, "certidao_comercial"),
        },
        {
          type: "DOC_COMPROVANTE_REPRESENTANTE_LEGAL_EMPRESA",
          url: getUrl(uploaded, "doc_comprovante_representante_legal_empresa"),
          public_id: getPublicId(uploaded, "doc_comprovante_representante_legal_empresa"),
        },
      ],
      COMPANY_CLIENT_DOCS
    );

    await profileRole.updateAllProfileRolesStatus(profile_id, false);
    await profileRole.insertValues(profile_id, 1, "PENDING");
  },

  createOwnerIndividual: async (
    user_id: number,
    data: {
      full_name: string;
      birth_date: Date;
      phone: string;
      bi: string;
      nif: string;
      bank_account: string;
    },
    files: MulterFiles
  ) => {
    const uploaded = await uploadFiles(files, "profiles/individual-owner");

    const existingProfile = await profileRepository.findByUserId(user_id)
    
    if(!existingProfile) throw new AppError('Profile inexistente!', 400)
    
    const {id: profile_id} = existingProfile
    
    const existingPerson = await person_profilesRepository.findById(profile_id);
    
    if (!existingPerson) {
      await person_profilesRepository.createBase(profile_id, data);
    } else {
      throw new AppError('Usuario ja existente',400)
    }

    const existingRole = await profileRole.findProfileRoleByRole(profile_id, 2);
    
    if (existingRole) throw new AppError("Owner já existe", 400);

    await profileMediaRepository.upsertDocuments(
      profile_id,
      [
        {
          type: "BI",
          url: getUrl(uploaded, "bi"),
          public_id: getPublicId(uploaded, "bi"),
          document_number: data.bi,
        },
        {
          type: "NIF",
          document_number: data.nif,
        },
        {
          type: "COMPROVATIVO_TITULARIDADE_CONTA_BANCARIA",
          url: getUrl(uploaded, "comprovativo_titularidade_conta_bancaria"),
          public_id: getPublicId(uploaded, "comprovativo_titularidade_conta_bancaria"),
          document_number: data.bank_account,
        },
      ],
      INDIVIDUAL_OWNER_DOCS
    );

    await profileRole.updateAllProfileRolesStatus(profile_id, false);
    await profileRole.insertValues(profile_id, 2, "PENDING");
  },

  createOwnerCompany: async (
    user_id: number,
    data: {
      legal_name: string;
      phone: string;
      nif: string;
      nameOfLegalRepresentative: string;
      bank_account: string;
    },
    files: MulterFiles
  ) => {
    const uploaded = await uploadFiles(files, "profiles/company-owner");

    const existingProfile = await profileRepository.findByUserId(user_id)

    if(!existingProfile) throw new AppError('Profile inexistente!', 400)

    const {id: profile_id} = existingProfile
    
    const existingCompany = await companyProfileRepository.findById(profile_id);
    
    if (!existingCompany) {
      await companyProfileRepository.createBase(profile_id, data);
    } else {
      throw new AppError('Empresa ja existente',400) 
    }

    const existingRole = await profileRole.findProfileRoleByRole(profile_id, 2);
    if (existingRole) throw new AppError("Owner já existe", 400);

    await profileMediaRepository.upsertDocuments(
      profile_id,
      [
        {
          type: "BI_REPRESENTANTE",
          url: getUrl(uploaded, "bi_representante"),
          public_id: getPublicId(uploaded, "bi_representante"),
        },
        {
          type: "CERTIDAO_COMERCIAL",
          url: getUrl(uploaded, "certidao_comercial"),
          public_id: getPublicId(uploaded, "certidao_comercial"),
        },
        {
          type: "DOC_COMPROVANTE_REPRESENTANTE_LEGAL_EMPRESA",
          url: getUrl(uploaded, "doc_comprovante_representante_legal_empresa"),
          public_id: getPublicId(uploaded, "doc_comprovante_representante_legal_empresa"),
        },
        {
          type: "COMPROVATIVO_TITULARIDADE_CONTA_BANCARIA",
          url: getUrl(uploaded, "comprovativo_titularidade_conta_bancaria"),
          public_id: getPublicId(uploaded, "comprovativo_titularidade_conta_bancaria"),
          document_number: data.bank_account,
        },
      ],
      COMPANY_OWNER_DOCS
    );

    await profileRole.updateAllProfileRolesStatus(profile_id, false);
    await profileRole.insertValues(profile_id, 2, "PENDING");
  },
}
