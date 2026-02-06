import "dotenv/config";
import { env } from "prisma/config";
import { app } from "./src/app.js";

const PORT = env("PORT") || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando no host http://localhost:${PORT}`);
});
