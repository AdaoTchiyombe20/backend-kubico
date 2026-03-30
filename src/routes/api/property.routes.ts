import { Router } from "express";
import { propertyController } from "../../controllers/property.controller.js";
import { profile } from "node:console";

const propertyRoute = Router()

propertyRoute.get("/", propertyController.findAll)
propertyRoute.post("/", propertyController.createProperty)
propertyRoute.post("/publish/:id", propertyController.publishProperty)
propertyRoute.get("/userProperties", propertyController.findUserProperties)

export {propertyRoute}
