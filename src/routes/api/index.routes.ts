import { Router } from "express";
import { userRouter } from "./user.routes.js";
import { authRouter } from "./auth.routes.js";
import { authorizeNormalAccessTokenMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

//routes
router.use("/users", authorizeNormalAccessTokenMiddleware, userRouter); //user route
router.use("/auth", authRouter); //auth route

export { router };
