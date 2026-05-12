import "dotenv/config";
import { ENV } from "./src/config/env.js";
import { app } from "./src/app.js";

const PORT = ENV.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando no host http://localhost:${PORT}`);
});
