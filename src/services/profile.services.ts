import { AppError } from "../errors/App.Errors.js";
import { profileRole } from "../repositories/userProfile/profileRole.repositories.js";
import { person_profilesRepository } from "../repositories/userProfile/personProfiles.repositories.js";
import { profileMediaRepository } from "../repositories/userProfile/profileMedia.repositories.js";
import { companyProfileRepository } from "../repositories/userProfile/companyProfile.repositories.js";
import { DocType } from "../../generated/prisma/index.js";

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

const COMPANY_OWNER_DOCS: DocType[] = [
  "CERTIDAO_PREDIAL",
  "CADERNETA_PREDIAL",
  "LICENCA_UTILIZACAO",
  "CERTIDAO_NEGATIVA_ONUS",
];

const COMPANY_CLIENT_DOCS: DocType[] = [
  "BI_REPRESENTANTE",
  "NIF",
  "CERTIDAO_COMERCIAL",
  "COMPROVANTE_RESIDENCIA",
];

export const profileService = {
  createClientIndividual: async (
    profile_id: number,
    data: {
      full_name: string;
      birth_date: Date;
      phone: string;
    },
    documents: { type: DocType; url: string; document_number?: string }[]
  ) => {
    const existing = await person_profilesRepository.findById(profile_id);

    if (!existing) {
      await person_profilesRepository.createBase(profile_id, data);
    }


    await profileMediaRepository.upsertDocuments(
      profile_id,
      documents,
      BASE_INDIVIDUAL_DOCS
    );

     const existingProfileRole = await profileRole.findProfileRoleByRole(profile_id, 1);

    if(existingProfileRole)
      throw new AppError('Cliente ja existe', 400)

    await profileRole.updateAllProfileRolesStatus(profile_id, false)
  
    await profileRole.insertValues(profile_id,1,'PENDING')
    
  },

  createOwnerIndividual: async (
    profile_id: number,
    data: {
      full_name: string;
      birth_date: Date;
      phone: string;
    },
    documents: { type: DocType; url?: string; document_number?: string }[]
  ) => {
    const existing = await person_profilesRepository.findById(profile_id);

    if (!existing) {
      await person_profilesRepository.createBase(profile_id, data);
    } else {
      // Perfil já existe — pode atualizar dados base se necessário
      await person_profilesRepository.updateById(profile_id, data);
    }

    // Owner precisa dos docs base + docs de propriedade
    const createOwnerIndividual: DocType[] = [...BASE_INDIVIDUAL_DOCS, ...INDIVIDUAL_OWNER_EXTRA_DOCS];

    await profileMediaRepository.upsertDocuments(
      profile_id,
      documents,
      createOwnerIndividual
    );

     const existingProfileRole = await profileRole.findProfileRoleByRole(profile_id, 2);

    if(existingProfileRole)
      throw new AppError("Owner Ja existe!", 400)
        await profileRole.updateAllProfileRolesStatus(profile_id, false)
    await profileRole.insertValues(profile_id,2,'PENDING')
     

  },

  createClientCompany: async (
    profile_id: number,
    data: {
      legal_name: string;
      phone: string;
      nif: string;
      nameOfLegalRepresentative: string;
    },
    documents: { type: DocType; url: string; document_number?: string }[]
  ) => {
    
    const existing = await companyProfileRepository.findById(profile_id);

    if (!existing) {
      await companyProfileRepository.createBase(profile_id, data);
    }
    
    const existingProfileRole = await profileRole.findProfileRoleByRole(profile_id, 1);

    if(existingProfileRole)
      throw new AppError("Cliente Ja existe!", 400)
      await profileRole.updateAllProfileRolesStatus(profile_id, false)
    await profileRole.insertValues(profile_id,1,'PENDING')
 
    await profileMediaRepository.upsertDocuments(profile_id, documents, COMPANY_CLIENT_DOCS);

  },

  createOwnerCompany: async (
    profile_id: number,
    data: {
      legal_name: string;
      phone: string;
      nif: string;
      nameOfLegalRepresentative: string;
      bank_account: string; // obrigatório para owner
    },
    documents: { type: DocType; url: string; document_number?: string }[]
  ) => {
    const existing = await companyProfileRepository.findById(profile_id);

    if (!existing) {
      // Cria do zero com bank_account
      await companyProfileRepository.createBase(profile_id, data);
    } else {
      // Já existe (era client), só atualiza bank_account
      await companyProfileRepository.updateById(profile_id, {
        bank_account: data.bank_account,
      });
    }
    
    const existingProfileRole = await profileRole.findProfileRoleByRole(profile_id, 2);

    if (existingProfileRole) {
      throw new AppError("Owner já existe!", 400);
    }
      await profileRole.updateAllProfileRolesStatus(profile_id, false)
    await profileRole.insertValues(profile_id, 2, 'PENDING');

    await profileMediaRepository.upsertDocuments(profile_id, documents, COMPANY_OWNER_DOCS);

  },
};
