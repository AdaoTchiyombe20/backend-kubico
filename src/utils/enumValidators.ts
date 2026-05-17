
import { TypeProperties, Property_purchase } from "@prisma/client";
import { AppError } from "../errors/App.Errors.js";

export const parseTypeProperties = (value?: string): TypeProperties | undefined => {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (Object.values(TypeProperties).includes(upper as TypeProperties)) {
    return upper as TypeProperties;
  }
  throw new AppError(
    `Tipo de propriedade inválido: "${value}". Valores aceitos: ${Object.values(TypeProperties).join(", ")}`,
    400
  );
};

export const parsePropertyPurchase = (value?: string): Property_purchase | undefined => {
  if (!value) return undefined;
  const upper = value.toUpperCase();
  if (Object.values(Property_purchase).includes(upper as Property_purchase)) {
    return upper as Property_purchase;
  }
  throw new AppError(
    `Tipo de compra inválido: "${value}". Valores aceitos: ${Object.values(Property_purchase).join(", ")}`,
    400
  );
};

