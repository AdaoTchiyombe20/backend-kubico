import { Router } from "express";
import { userController } from "../../controllers/user.controller.js";
import { authorizeRoleAcessTokenMiddleware } from "../../middlewares/auth.middleware.js";
import { verifyProfile } from "./verifyProfile.routes.js";
import { assumeRole } from "./assumeRole.routes.js";
const userRouter = Router();

//user routes
/* userRouter.put(
  "/update-user",
  authorizeRoleAcessTokenMiddleware(["ADMIN", "NORMAL", "CLIENT", "OWNER"]),
  userController.update,
); */
userRouter.put(
  "/update-email",
  authorizeRoleAcessTokenMiddleware(["NORMAL", "CLIENT", "OWNER"]),
  userController.updateEmail,
);
userRouter.delete(
  "/",
  authorizeRoleAcessTokenMiddleware(["ADMIN", "NORMAL", "CLIENT", "OWNER"]),
  userController.delete,
);

//Routes to authenticate client and owner
userRouter.use("/verify", verifyProfile);

//only admin can access
userRouter.get(
  "/",
  authorizeRoleAcessTokenMiddleware(["ADMIN"]),
  userController.findAll,
);
userRouter.get(
  "/:id",
  authorizeRoleAcessTokenMiddleware(["ADMIN"]),
  userController.findById,
);

//assume roles
userRouter.use(
  "/assume-roles",
  authorizeRoleAcessTokenMiddleware(["NORMAL", "CLIENT", "OWNER"]),
  assumeRole,
);

export { userRouter };
