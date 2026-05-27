
import { TypeProperties, Property_purchase } from "@prisma/client";
import { AppError } from "../errors/App.Errors.js";

export const parseTypeProperties = (value?: string): TypeProperties | undefined => {
  if (!value) return undefined;
  const upper = value.trim().toUpperCase();
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
  const upper = value.trim().toUpperCase();

  const aliases: Record<string, Property_purchase> = {
    SALE: Property_purchase.FOR_SALE,
    SELL: Property_purchase.FOR_SALE,
    VENDA: Property_purchase.FOR_SALE,
    VENDER: Property_purchase.FOR_SALE,
    RENT: Property_purchase.FOR_RENT,
    RENTAL: Property_purchase.FOR_RENT,
    ARRENDAMENTO: Property_purchase.FOR_RENT,
    ARRENDAR: Property_purchase.FOR_RENT,
    ALUGUEL: Property_purchase.FOR_RENT,
    ALUGAR: Property_purchase.FOR_RENT,
  };

  if (aliases[upper]) return aliases[upper];

  if (Object.values(Property_purchase).includes(upper as Property_purchase)) {
    return upper as Property_purchase;
  }
  throw new AppError(
    `Tipo de compra inválido: "${value}". Valores aceitos: ${Object.values(Property_purchase).join(", ")}`,
    400
  );
};

