import { Router } from "express";
import { propertyController } from "../../controllers/property.controller.js";
import { multerUploads } from "../../middlewares/multer.middleware.js";

const { uploadImagesAndVideo, uploadImg, uploadVideo } = multerUploads;

const propertyRoute = Router();

// ✅ FAVORITOS (mais específico - colocar PRIMEIRO)
propertyRoute.get("/favorites", propertyController.getUserFavorites);
propertyRoute.post("/favorites/:id", propertyController.addToFavorites);
propertyRoute.delete("/favorites/:id", propertyController.removeFromFavorites);

// PUBLICAÇÃO de imóveis (específicas também)
propertyRoute.get("/listings/search", propertyController.searchListings);
propertyRoute.get("/listings", propertyController.findAllListings);
propertyRoute.post("/publish/:id", propertyController.publishProperty);
propertyRoute.post("/unpublish/:id", propertyController.unPublishProperty);

// CRUD de imóveis (genérico - colocar POR ÚLTIMO)
propertyRoute.get("/", propertyController.findAll);
propertyRoute.get("/owner", propertyController.findUserProperties);
propertyRoute.post("/", uploadImagesAndVideo.fields([
  { name: "images", maxCount: 5 },
  { name: "video", maxCount: 1 },
]), propertyController.createProperty);
propertyRoute.patch("/:id/info", propertyController.updatePropertyInfo);
propertyRoute.patch("/:id/media/:mediaId", uploadImagesAndVideo.single("file"), propertyController.updatePropertyMedia);
propertyRoute.post("/:id/media", uploadImagesAndVideo.single("file"), propertyController.addPropertyMedia);
propertyRoute.delete("/:id/media/:mediaId", propertyController.deletePropertyMedia);
propertyRoute.delete("/:id", propertyController.deleteProperty);
propertyRoute.get("/listings/:id", propertyController.findListingById);

export { propertyRoute };