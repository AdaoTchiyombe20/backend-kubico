import { Router } from "express";
import { propertyController } from "../../controllers/property.controller.js";
import { multerUploads } from "../../middlewares/multer.middleware.js";

const { uploadImagesAndVideo, uploadImg, uploadVideo } = multerUploads;

const propertyRoute = Router();

//crud de imóveis
propertyRoute.get("/", propertyController.findAll);
propertyRoute.get("/owner", propertyController.findUserProperties);
propertyRoute.delete("/:id", propertyController.deleteProperty);
propertyRoute.post(
  "/",
  uploadImagesAndVideo.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
  ]),
  propertyController.createProperty,
);
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

//publicação de imóveis
propertyRoute.get("/listings", propertyController.findAllListings);
propertyRoute.get("/listings/:id", propertyController.findListingById);
propertyRoute.get("/listings/search", propertyController.searchListings);
propertyRoute.post("/publish/:id", propertyController.publishProperty);
propertyRoute.post("/unpublish/:id", propertyController.unPublishProperty);


export { propertyRoute };
