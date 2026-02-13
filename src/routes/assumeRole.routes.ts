import { Router } from "express";
import { assumeRolesController } from "../controllers/assumeRoles.controller.js";

const assumeRole = Router()

assumeRole.get('/client', assumeRolesController.assumeClient) 
assumeRole.get('/owner', assumeRolesController.assumeOwner) 


export {assumeRole}
