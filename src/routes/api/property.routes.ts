import { Router } from "express";
import { propertyController } from "../../controllers/property.controller.js";
import { multerUploads } from "../../middlewares/multer.middleware.js";

const { uploadImagesAndVideo } = multerUploads;

const propertyRoute = Router()

propertyRoute.get("/", propertyController.findAll)
propertyRoute.post("/", uploadImagesAndVideo.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 }
]), propertyController.createProperty)
propertyRoute.post("/publish/:id", propertyController.publishProperty)
propertyRoute.get("/userProperties", propertyController.findUserProperties)

export {propertyRoute}
