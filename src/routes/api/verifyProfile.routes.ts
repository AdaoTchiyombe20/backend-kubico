import { Router } from "express";
import { profileController } from "../../controllers/profiles.controller.js";
import { multerUploads } from "../../middlewares/multer.middleware.js";
import { authorizeRoleAcessTokenMiddleware } from "../../middlewares/auth.middleware.js";

const {uploadFilesFromProfile} = multerUploads

const verifyProfile = Router()

verifyProfile.post('/individual-owner', profileController.createOwnerIndividual) 

verifyProfile.post('/company-owner',profileController.createOwnerCompany) 

export {verifyProfile}
