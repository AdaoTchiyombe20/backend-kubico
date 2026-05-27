import express from "express";
import { router } from "./routes/api/index.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import { swaggerRoutes } from "./routes/infra/swagger.routes.js";
import { globalRateLimiting } from "../lib/ratelimiting.js";
import fs from 'fs'
import path from "path";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "http://localhost:5173", //frontend local
  "http://localhost:4000", //backend swagger local
  "https://backend-kubico-production.up.railway.app", //backend production 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

app.set('trust proxy', 1)
/* app.use(globalRateLimiting) */

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
