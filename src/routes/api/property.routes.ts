import { Router } from "express";
import { propertyController } from "../../controllers/property.controller.js";
import { multerUploads } from "../../middlewares/multer.middleware.js";

const { uploadImagesAndVideo, uploadImg, uploadVideo } = multerUploads;

const propertyRoute = Router();

propertyRoute.get("/", propertyController.findAll);
propertyRoute.get("/owner", propertyController.findUserProperties);

propertyRoute.post(
  "/",
  uploadImagesAndVideo.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  propertyController.createProperty,
);

propertyRoute.post("/publish/:id", propertyController.publishProperty);
propertyRoute.post("/unpublish/:id", propertyController.unPublishProperty);

propertyRoute.patch("/:id/info", propertyController.updatePropertyInfo);

propertyRoute.patch(
  "/:id/media/:mediaId",
  uploadImagesAndVideo.single("file"),
  propertyController.updatePropertyMedia,
);

propertyRoute.post(
  "/:id/media",
  uploadImagesAndVideo.single("file"),
  propertyController.addPropertyMedia,
);

propertyRoute.delete("/:id/media/:mediaId", propertyController.deletePropertyMedia);

propertyRoute.delete("/:id", propertyController.deleteProperty);

export { propertyRoute };
