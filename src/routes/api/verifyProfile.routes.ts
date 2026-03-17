import { Router } from "express";
import { profileController } from "../../controllers/profiles.controller.js";
import { multerUploads } from "../../middlewares/multer.middleware.js";
import { authorizeRoleAcessTokenMiddleware } from "../../middlewares/auth.middleware.js";

const {uploadFilesFromProfile} = multerUploads

const verifyProfile = Router()

verifyProfile.post('/individual-client',uploadFilesFromProfile.fields([
  { name: 'bi', maxCount: 1 },
  { name: 'selfie_with_bi', maxCount: 1}
]), profileController.createClientIndividual)

verifyProfile.post('/company-client',uploadFilesFromProfile.fields([
  { name: 'bi_representante', maxCount: 1 },
  { name: 'certidao_comercial', maxCount: 1},
  { name: 'doc_comprovante_representante_legal_empresa', maxCount: 1},
]), profileController.createClientCompany)

verifyProfile.post('/individual-owner',uploadFilesFromProfile.fields([
  { name: 'bi', maxCount: 1 },
  { name: 'comprovativo_titularidade_conta_bancaria', maxCount: 1 }
]), profileController.createOwnerIndividual) 

verifyProfile.post('/company-owner', uploadFilesFromProfile.fields([
  { name: 'comprovativo_titularidade_conta_bancaria', maxCount: 1 },
  { name: 'bi_representante', maxCount: 1},
  { name: 'certidao_comercial', maxCount: 1},
  { name: 'doc_comprovante_representante_legal_empresa', maxCount: 1},
]),profileController.createOwnerCompany) 

export {verifyProfile}
