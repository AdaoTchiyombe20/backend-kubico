import { AppError } from "../errors/App.Errors.js";
import { profileRole } from "../repositories/userProfile/profileRole.repositories.js";
import { person_profilesRepository } from "../repositories/userProfile/personProfiles.repositories.js";
import { profileMediaRepository } from "../repositories/userProfile/profileMedia.repositories.js";
import { companyProfileRepository } from "../repositories/userProfile/companyProfile.repositories.js";
import { profileRepository } from "../repositories/userProfile/profile.repositories.js";

// ─── Service ──────────────────────────────────────────────────────────────────
export const profileService = {
  createOwnerIndividual: async (
    user_id: number,
    data: {
      full_name: string,
      birth_date: Date,
      phone: string,
      bi: string,
      nif: string,
      bank_account: string,
    }
  ) => {
    try{
      const {full_name, birth_date, phone, bi, nif, bank_account} = data
      const existingProfile = await profileRepository.findByUserId(user_id)
      
      if(!existingProfile) throw new AppError('Profile inexistente!', 400)
      
      const {id: profile_id} = existingProfile
      
      const existingPersonProfile = await person_profilesRepository.findById(profile_id);
  
      if (existingPersonProfile)
        throw new AppError('Usuario ja existe',400) 
      
      await person_profilesRepository.createBase(profile_id, {full_name,birth_date,phone});
    
      const existingRole = await profileRole.findProfileRoleByRole(profile_id, 2); 
      if (existingRole) throw new AppError("Owner ja existe", 400);
  
      await profileMediaRepository.insertMedia(profile_id, 'BI', bi)
      await profileMediaRepository.insertMedia(profile_id, 'NIF', nif)
      await profileMediaRepository.insertMedia(profile_id, 'CONTA_BANCARIA', bank_account)
      
      await profileRole.updateAllProfileRolesStatus(profile_id, false);
      await profileRole.insertValues(profile_id, 2, "PENDING");

    }catch(error){
      throw new AppError(`Erro: ${error}`, 400)
    }
  },
  
  createOwnerCompany: async (
    user_id: number,
    data: {
      legal_name: string,
      phone: string,
      nif: string,
      bank_account: string,
    }) => {
    try{
      const {legal_name, phone, nif, bank_account} = data
      
      const existingProfile = await profileRepository.findByUserId(user_id)
      
      if(!existingProfile) throw new AppError('Profile inexistente!', 400)
        
      const {id: profile_id} = existingProfile
        
        
      const existingCompany = await companyProfileRepository.findById(profile_id);
      
      if (!existingCompany) {
        await companyProfileRepository.createBase(profile_id, {legal_name, phone});
      } else {
        throw new AppError('Empresa ja existente',400) 
      }
        
      const existingRole = await profileRole.findProfileRoleByRole(profile_id, 2);
      
      if (existingRole) throw new AppError("Owner já existe", 400);

      await profileMediaRepository.insertMedia(profile_id, 'NIF', nif)
      await profileMediaRepository.insertMedia(profile_id, 'CONTA_BANCARIA', bank_account)
        
      await profileRole.updateAllProfileRolesStatus(profile_id, false);
      await profileRole.insertValues(profile_id, 2, "PENDING");

    }catch(error){
      throw new AppError(`Erro: ${error}`, 400)
    }
  },

}

