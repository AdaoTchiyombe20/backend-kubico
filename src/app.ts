import express from "express";
import { router } from "./routes/api/index.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import { swaggerRoutes } from "./routes/infra/swagger.routes.js";

const app = express();

app.use("/docs", swaggerRoutes);
app.use(cookieParser());
app.use(express.json());
app.use("/api", router);
app.use(errorHandler);

export { app };
