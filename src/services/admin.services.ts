import { profileRepository } from "../repositories/userProfile/profile.repositories.js";
import { AppError } from "../errors/App.Errors.js";

export const adminService = {
    //Profiles
      findProfiles: async () => {
        return await profileRepository.findAll();
      },
      findProfileById: async (id: number) => {
        const profile = await profileRepository.findById(id);
    
        if (!profile) 
            throw new AppError("Perfil Inexistente!!!", 400);
    
        return profile;
      },
      findVerifications: async() => {

      }, 
      approveProfiles: async() => {

      }, 
      rejectProfiles: async() => {

      }, 
      
      //Properties
      getPeddingProperties: async() => {

      }, 
      approveProperties: async() => {

      }, 
      rejectProperties: async() => {

      }, 

      //Plans
      createPlan: async() => {

      }, 
      editPlan: async() => {

      }, 
      deletePlan: async() => {

      }, 
      
}
