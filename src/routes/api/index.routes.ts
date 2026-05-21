import { Router } from "express";
import { userRouter } from "./user.routes.js";
import { authRouter } from "./auth.routes.js";
import { authorizeNormalAccessTokenMiddleware } from "../../middlewares/auth.middleware.js";
import { adminRoute } from "./admin.routes.js";
import { verifyProfile } from "./verifyProfile.routes.js";
import { assumeRole } from "./assumeRole.routes.js";
import { authorizeRoleAcessTokenMiddleware } from "../../middlewares/auth.middleware.js";
import { propertyRoute } from "./property.routes.js";

const router = Router();

const withRole = (...roles: string[]) => [
  authorizeNormalAccessTokenMiddleware,
  authorizeRoleAcessTokenMiddleware(roles),
  
];

//routes
router.use("/users", authorizeNormalAccessTokenMiddleware, userRouter)
router.use("/auth", authRouter)
router.use("/profile", authorizeNormalAccessTokenMiddleware, verifyProfile)
router.use("/admin", withRole("admin"), adminRoute) 
router.use("/assume-roles",withRole("client", "owner"), assumeRole);
router.use("/properties", withRole("admin","owner"), propertyRoute)
router.use("/FavoritesProperties", withRole("admin","client"), propertyRoute)

export { router };
