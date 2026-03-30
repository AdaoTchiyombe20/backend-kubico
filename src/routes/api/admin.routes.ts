import { Router } from "express";
import { adminController } from "../../controllers/admin.controller.js";

const adminRoute = Router()

//admin managements of profiles
adminRoute.get( "/profiles", adminController.findAll);
adminRoute.get("/profiles/:id", adminController.findById);
adminRoute.get("/profiles/:id/ban", adminController.banProfile);
adminRoute.get("/profiles/:id/unBan", adminController.unBanProfile);
adminRoute.get('/profiles/verifications', adminController.findVerifications)
adminRoute.put('/profiles/verifications/:id/approve', adminController.approveProfiles)
adminRoute.put('/profiles/verifications/:id/reject', adminController.rejectProfiles)

//admin managements of Properties
adminRoute.get('/properties/peding', adminController.getPeddingProperties)
adminRoute.put('/properties/:id/approve', adminController.approveProperties)
adminRoute.put('/properties/:id/reject', adminController.rejectProperties)

// admin managements of plans
adminRoute.post('/plans', adminController.createPlan)
adminRoute.put('/plans/:id', adminController.editPlan)
adminRoute.delete('/plans/:id', adminController.deletePlan)

export {adminRoute}
