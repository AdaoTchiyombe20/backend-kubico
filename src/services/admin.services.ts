import "dotenv/config";
import { env } from "prisma/config";
import { profileRepository } from "../repositories/userProfile/profile.repositories.js";
import { AppError } from "../errors/App.Errors.js";
import { userRepository } from "../repositories/auth/user.repositories.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { profileRole } from "../repositories/userProfile/profileRole.repositories.js";
import { authRepositories } from "../repositories/auth/auth.repositories.js";
import { adminRepository } from "../repositories/admin/admin.respositories.js";
import type { AccessLevel } from "../../generated/prisma/index.js";
import { sendVerificationEmail } from "./mail.services.js";
import jwt from 'jsonwebtoken'


export const adminService = {

    //auth
    createAdmin: async(userName: string ,email: string, adminPassword: string ,accessLevel: AccessLevel )=> {

     try{
        
        const verifyEmail = await userRepository.findByEmail(email)
        
        if(verifyEmail) throw new AppError('This e-mail alredy exist',400)
        
        const password = await hashPassword(adminPassword)

        const createuser = await authRepositories.signUp({email, password})

        const createAdminProfile = await profileRepository.createProfile(createuser.id, 'INDIVIDUAL')

        const createAdminRole = await profileRole.insertValues(createAdminProfile.id,3,"PENDING")

        await adminRepository.createAdmin(createuser.id, createAdminRole.id, accessLevel)

        const emailVerificatioTonken = jwt.sign(
                  {
                    iss: 'kubico-api',
                    sub: createuser.id,
                    iat: Math.floor(Date.now() / 1000),
                    aud: email
                  },
                  env('JWT_SECRET'),
                  {
                  expiresIn: '15m' 
                  }
                )
        await sendVerificationEmail(email,emailVerificatioTonken)

      }catch(error){
        throw new AppError(`Error: ${error}`)
      }
    },
    login: async(email: string, password: string)=> {
     try{
        const findEmail = await userRepository.findByEmail(email)

        if(!findEmail) throw new AppError('User not Found', 404)
        
        const findProfileById = await profileRepository.findByUserId(findEmail.id)

        if(!findProfileById) throw new AppError('Profile not Found', 404)
        
        const verifyAdmin = await profileRole.findProfileRoleByRole(findProfileById.id, 3)

        const verifiyPassword = comparePassword(password, findEmail!.password)
      }catch(error){
        throw new AppError(`Erro ao entrar como admin: ${error}`, 400)
      }
    },
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
