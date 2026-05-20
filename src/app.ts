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
  "http://localhost:5173",
  "http://localhost:4000",
  "https://backend-kubico-production.up.railway.app", 
];
app.use((req, res, next) => {
  console.log('🔍 Headers recebidos:', req.headers);
  console.log('🔍 Cookies recebidos:', req.cookies);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      console.log('🔍 Origin:', origin);
      callback(null, true);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

app.use(cookieParser());

app.set('trust proxy', 1)
app.use(globalRateLimiting)
app.use(express.json());

app.use("/docs", swaggerRoutes);
app.use("/api", router);
app.use(errorHandler);


const tmpDir = path.join(process.cwd(), "uploads", "tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

export { app };