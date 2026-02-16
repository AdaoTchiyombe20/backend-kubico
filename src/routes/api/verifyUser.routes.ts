import { Router } from "express";
import { userController } from "../../controllers/user.controller.js";

export const verifyUser = Router()

verifyUser.post('/client', userController.createClient)
verifyUser.post('/owner', userController.createOwner) 
