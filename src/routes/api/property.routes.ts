import { Router } from "express";
import { propertyController } from "../../controllers/property.controller.js";
import { multerUploads } from "../../middlewares/multer.middleware.js";
import {
  authorizeNormalAccessTokenMiddleware,
  authorizeRoleAcessTokenMiddleware,
  optionalAccessTokenMiddleware,
} from "../../middlewares/auth.middleware.js";
import { cleanupMulterFiles } from "../../middlewares/multer.middleware.js";
const { uploadImagesAndVideo, uploadImg, uploadVideo } = multerUploads;

const withRole = (...roles: string[]) => [
  authorizeNormalAccessTokenMiddleware,
  authorizeRoleAcessTokenMiddleware(roles),
  
];

const propertyRoute = Router();

// ✅ FAVORITOS (mais específico - colocar PRIMEIRO)
propertyRoute.get("/favorites", withRole("client"), propertyController.getUserFavorites);
propertyRoute.post("/favorites/:id", withRole("client"), propertyController.addToFavorites);
propertyRoute.delete("/favorites/:id", withRole("client"), propertyController.removeFromFavorites);

// PUBLICAÇÃO de imóveis (específicas também)
propertyRoute.get("/listings/search", optionalAccessTokenMiddleware, propertyController.searchListings);
propertyRoute.get("/listings", optionalAccessTokenMiddleware, propertyController.findAllListings);
propertyRoute.get("/listings/:id", propertyController.findListingById);
propertyRoute.post("/publish/:id", withRole("owner"), propertyController.publishProperty);
propertyRoute.post("/unpublish/:id", withRole("owner"), propertyController.unPublishProperty);

// CRUD de imóveis (genérico - colocar POR ÚLTIMO)
propertyRoute.get("/", withRole("admin"), propertyController.findAll);
propertyRoute.get("/owner", withRole("owner", "client"), propertyController.findUserProperties);
propertyRoute.post("/",withRole("owner"), uploadImagesAndVideo.fields([
  { name: "images", maxCount: 5 },
  { name: "video", maxCount: 1 },
]), cleanupMulterFiles, propertyController.createProperty);
propertyRoute.patch("/:id/info", withRole("owner"), propertyController.updatePropertyInfo);
propertyRoute.patch("/:id/media/:mediaId",withRole("owner"), uploadImagesAndVideo.single("file"), propertyController.updatePropertyMedia);
propertyRoute.post("/:id/media", withRole("owner"), uploadImagesAndVideo.single("file"), propertyController.addPropertyMedia);
propertyRoute.delete("/:id/media/:mediaId", withRole("owner"), propertyController.deletePropertyMedia);
propertyRoute.delete("/:id", withRole("owner"), propertyController.deleteProperty);

export { propertyRoute };
