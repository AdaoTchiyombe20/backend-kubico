import { Router } from "express";
import { userController } from "../../controllers/user.controller.js";
import { authorizeRoleAcessTokenMiddleware } from "../../middlewares/auth.middleware.js";

const userRouter = Router();

//user routes
userRouter.put("/update-email",authorizeRoleAcessTokenMiddleware(["NORMAL", "CLIENT", "OWNER"]),userController.updateEmail);
userRouter.delete("/",authorizeRoleAcessTokenMiddleware(["ADMIN", "NORMAL", "CLIENT", "OWNER"]),userController.delete);

export { userRouter };
