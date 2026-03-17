import express from "express";
import { router } from "./routes/api/index.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import { swaggerRoutes } from "./routes/infra/swagger.routes.js";
import { globalRateLimiting } from "../lib/ratelimiting.js";
import fs from 'fs'
import path from "path";
const app = express();

app.use(globalRateLimiting)

app.use("/docs", swaggerRoutes);
app.use(cookieParser());
app.use(express.json());
app.use("/api", router);
app.use(errorHandler);


const tmpDir = path.join(process.cwd(), "uploads", "tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

export { app };
