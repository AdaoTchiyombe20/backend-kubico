import { Router } from "express";
import { userController } from "../../controllers/user.controller.js";
import {
  authorizeRoleAcessTokenMiddleware,
  authorizeRefreshTokenMiddleware,
} from "../../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.put(
  "/update-email",
  authorizeRefreshTokenMiddleware,
  authorizeRoleAcessTokenMiddleware(["NORMAL", "CLIENT", "OWNER"]),
  userController.updateEmail
);

userRouter.delete(
  "/",
  authorizeRefreshTokenMiddleware,
  authorizeRoleAcessTokenMiddleware(["ADMIN", "NORMAL", "CLIENT", "OWNER"]),
  userController.delete
);

userRouter.patch(
  "/update-password",
  authorizeRefreshTokenMiddleware,
  authorizeRoleAcessTokenMiddleware(["NORMAL", "CLIENT", "OWNER"]),
  userController.updatePassword
);

export { userRouter };