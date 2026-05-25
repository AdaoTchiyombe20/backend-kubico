import {
  PricingType,
  type PaymentType,
} from "@prisma/client";

import type { PaymentDto } from "../dto/payment.dto.js";

import { AppError } from "../errors/App.Errors.js";

import { negociationRepository } from "../repositories/negociationEvent/negociation.repository.js";
import { profileRole } from "../repositories/Profile/profileRole.repositories.js";
import { propertyRepository } from "../repositories/property/properties.repositories.js";
import { propertyListingRepository } from "../repositories/property/propertyListing.repositories.js";
import { PaymentsRepository } from "../repositories/payment/payments..repository.js";
import { platformPricingRepository } from "../repositories/admin/plataform.pricing.js";

export const paymentsService = {
  processPayment: async (
    paymentData: PaymentDto
  ) => {
    try {
      const {
        listed_property_id,
        client_id,
        paymentType,
      } = paymentData;


      const listing =
        await propertyListingRepository.findActiveListing(
          listed_property_id
        );

      if (!listing) {
        throw new AppError(
          "Propriedade não encontrada",
          404
        );
      }

      if (listing.status !== "DISPONIVEL") {
        throw new AppError(
          "Propriedade não disponível para compra",
          400
        );
      }


      const property =
        await propertyRepository.findUniquePropertyById(
          listing.property_id
        );

      if (!property) {
        throw new AppError(
          "Propriedade não encontrada",
          404
        );
      }


      const client =
        await profileRole.findProfileRoleByRole(
          client_id,
          1
        );

      if (!client) {
        throw new AppError(
          "Cliente não encontrado ou sem permissão",
          404
        );
      }


      const ownerProfile =
        await profileRole.findProfileRoleByRole(
          client_id,
          2
        );

      const isOwnerBuyingOwnProperty =
        ownerProfile?.id === property.id_owner;

      if (isOwnerBuyingOwnProperty) {
        throw new AppError(
          "Não pode comprar o próprio imóvel",
          400
        );
      }


      const existingPayment =
        await PaymentsRepository.findActivePayment(
          listed_property_id,
          client_id
        );

      if (existingPayment) {
        throw new AppError(
          "Já existe um pagamento em andamento",
          409
        );
      }


      const pricing =
        await getPropertyPricing(
          property.type_property_purchase
        );


      if (
        paymentType ===
        "NEGOCIATED_PURCHASE"
      ) {
        if (!property.is_negotiable) {
          throw new AppError(
            "Este imóvel não aceita negociação",
            400
          );
        }

        const negociation =
          await negociationRepository
            .findNegociationByClientAndProperty(
              client.id,
              listing.id
            );

        if (!negociation) {
          throw new AppError(
            "Nenhuma negociação encontrada",
            404
          );
        }

        if (
          negociation.status !==
          "ACCEPTED"
        ) {
          throw new AppError(
            "Pagamento apenas para negociações aceites",
            400
          );
        }

        if (
          negociation.accepted_value ===
          null
        ) {
          throw new AppError(
            "Valor aceite não encontrado",
            400
          );
        }

        return createPayment({
          property_listing_id:
            listed_property_id,
          client_id,
          owner_id: property.id_owner,
          negociation_id:
            negociation.id,
          payment_type:
            paymentType,
          amount:
            Number(
              negociation.accepted_value
            ),
          discount: pricing,
          property_title:
            property.title,
          property_price:
            Number(property.price),
        });
      }


      if (
        paymentType ===
        "DIRECT_PURCHASE"
      ) {
        if (
          property.is_negotiable
        ) {
          throw new AppError(
            "Este imóvel exige negociação",
            400
          );
        }

        return createPayment({
          property_listing_id:
            listed_property_id,
          client_id,
          owner_id:
            property.id_owner,
          negociation_id:
            null,
          payment_type:
            paymentType,
          amount:
            Number(property.price),
          discount:
            pricing,
          property_title:
            property.title,
          property_price:
            Number(property.price),
        });
      }

      throw new AppError(
        "Tipo de pagamento inválido",
        400
      );

    } catch (error) {
      if (
        error instanceof AppError
      ) {
        throw error;
      }

      throw new AppError(
        "Erro ao processar pagamento",
        500
      );
    }
  },
};


async function getPropertyPricing(
  purchaseType:
    | "FOR_SALE"
    | "FOR_RENT"
): Promise<number> {

  const pricingType =
    purchaseType === "FOR_RENT"
      ? PricingType.PROPERTY_RENT
      : PricingType.PROPERTY_SALE;

  const pricing =
    await platformPricingRepository
      .findActivePricingByType(
        pricingType
      );

  return Number(
    pricing?.amount ?? 5
  );
}

async function createPayment({
  property_listing_id,
  client_id,
  owner_id,
  negociation_id,
  payment_type,
  amount,
  discount,
  property_title,
  property_price,
}: {
  property_listing_id: number;
  client_id: number;
  owner_id: number;
  negociation_id:
    | number
    | null;
  payment_type:
    PaymentType;
  amount: number;
  discount: number;
  property_title: string;
  property_price: number;
}) {

  const platform_fee =
    amount * (discount / 100);

  const released_amount =
    amount - platform_fee;

  const payment =
    await PaymentsRepository
      .createPayments(
        property_listing_id,
        client_id,
        owner_id,
        negociation_id,
        payment_type,
        amount,
        platform_fee,
        released_amount,
        "HELD",
        property_title,
        property_price
      );

  return {
    message:
      "Pagamento processado com sucesso",
    payment,
  };
}