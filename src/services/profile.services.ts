import { AppError } from "../errors/App.Errors.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { person_profilesRepository } from "../repositories/Profile/personProfiles.repositories.js";
import { profileMediaRepository } from "../repositories/Profile/profileMedia.repositories.js";
import { companyProfileRepository } from "../repositories/Profile/companyProfile.repositories.js";
import { profileRepository } from "../repositories/Profile/profile.repositories.js";
import type { DocType } from "@prisma/client";

const validateUniqueData = async (fields: { type: DocType; value: string; label: string }[]) => {
  for (const { type, value, label } of fields) {
    const existing = await profileMediaRepository.findByTypeAndValue(type, value);
    if (existing) throw new AppError(`${label} já está em uso`, 400);
  }
};

export const profileService = {
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
  ) => {
    try {
      const { full_name, birth_date, phone, bi, nif, bank_account } = data;

      const existingProfile = await profileRepository.findByIdAnfType(user_id, 'INDIVIDUAL');
      if (!existingProfile) throw new AppError("Perfil Individual Inexistente!", 400);

      const { id: profile_id } = existingProfile;

      const existingPersonProfile = await person_profilesRepository.findById(profile_id);
      if (existingPersonProfile) throw new AppError("Usuário já existe", 400);

      const existingRole = await profileRole.findProfileRoleByRole(profile_id, 2);
      if (existingRole) throw new AppError("Owner já existe", 400);

      // ✅ phone agora validado aqui também
      await validateUniqueData([
        { type: "BI",             value: bi,           label: "BI"           },
        { type: "NIF",            value: nif,          label: "NIF"          },
        { type: "PHONE",          value: phone,        label: "Telefone"     },
        { type: "CONTA_BANCARIA", value: bank_account, label: "Conta Bancária" },
      ]);

      await person_profilesRepository.createBase(profile_id, { full_name, birth_date });
      await profileMediaRepository.insertMedia(profile_id, "BI",             bi);
      await profileMediaRepository.insertMedia(profile_id, "NIF",            nif);
      await profileMediaRepository.insertMedia(profile_id, "PHONE",          phone);
      await profileMediaRepository.insertMedia(profile_id, "CONTA_BANCARIA", bank_account);
      await profileRole.updateAllProfileRolesStatus(profile_id, false);
      await profileRole.insertValues(profile_id, 2, "APPROVED");

    } catch (error) {
      throw error instanceof AppError ? error : new AppError(`Erro: ${error}`, 500);
    }
  },

  createOwnerCompany: async (
    user_id: number,
    data: {
      legal_name: string;
      phone: string;
      nif: string;
      bank_account: string;
    },
  ) => {
    try {
      const { legal_name, phone, nif, bank_account } = data;

      const existingProfile = await profileRepository.findByIdAnfType(user_id, "COMPANY");
      if (!existingProfile) throw new AppError("Perfil Empresa Inexistente!", 400);

      const { id: profile_id } = existingProfile;

      const existingCompany = await companyProfileRepository.findById(profile_id);
      if (existingCompany) throw new AppError("Empresa já existente", 400);

      const existingRole = await profileRole.findProfileRoleByRole(profile_id, 2);
      if (existingRole) throw new AppError("Owner já existe", 400);

      await validateUniqueData([
        { type: "NIF",            value: nif,          label: "NIF"            },
        { type: "PHONE",          value: phone,        label: "Telefone"       },
        { type: "CONTA_BANCARIA", value: bank_account, label: "Conta Bancária" },
      ]);

      await companyProfileRepository.createBase(profile_id, { legal_name });
      await profileMediaRepository.insertMedia(profile_id, "NIF",            nif);
      await profileMediaRepository.insertMedia(profile_id, "PHONE",          phone);
      await profileMediaRepository.insertMedia(profile_id, "CONTA_BANCARIA", bank_account);
      await profileRole.updateAllProfileRolesStatus(profile_id, false);
      await profileRole.insertValues(profile_id, 2, "PENDING");

    } catch (error) {
      throw error instanceof AppError ? error : new AppError(`Erro: ${error}`, 500);
    }
  },
};
