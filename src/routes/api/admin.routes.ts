import { Router } from "express";
import { adminController } from "../../controllers/admin.controller.js";

const adminRoute = Router()
 
adminRoute.get('/users', adminController.findUsers)
adminRoute.get('/users/:id', adminController.findUserById)

adminRoute.get("/payments", adminController.findAllPayments)
adminRoute.get("/payments/received", adminController.findAllReceivedPayments)
adminRoute.get("/payments/released", adminController.findAllReleasedPayments)
adminRoute.patch("/payments/:id/release", adminController.releasePayment)
adminRoute.get("/payments/:id", adminController.findPaymentById)


adminRoute.get("/negotiations", adminController.findAllNegociations)
adminRoute.get("/negotiations/:id", adminController.findNegociation)

adminRoute.get("/properties", adminController.findAllProperties)

export {adminRoute}
