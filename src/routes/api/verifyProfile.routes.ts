import { Router } from "express";
import { profileController } from "../../controllers/profiles.controller.js";

export const verifyProfile = Router()

verifyProfile.post('/individual-client', profileController.createClientIndividual)
verifyProfile.post('/company-client', profileController.createClientCompany)
verifyProfile.post('/individual-owner', profileController.createOwnerIndividual) 
verifyProfile.post('/company-owner', profileController.createOwnerCompany) 
