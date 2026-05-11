import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerRoutes = Router();

const swaggerDocument = YAML.load("./src/docs/swagger.yaml");

swaggerRoutes.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export {swaggerRoutes}
