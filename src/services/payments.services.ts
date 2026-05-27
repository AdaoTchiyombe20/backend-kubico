import {
  ListingStatus,
  PaymentStatus,
  PricingType,
  propertySelingStatus,
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
import { historyPropertyRepository } from "../repositories/property/historyProperty.respositories.js";

export const paymentsService = {
  findMadePayments: async (profile_id: number) => {
    const client = await profileRole.findProfileRoleByRole(profile_id, 1);

    if (!client) {
      throw new AppError("Cliente nÃ£o encontrado ou sem permissÃ£o", 404);
    }

    const payments = await PaymentsRepository.findPaymentsByClientId(client.id);

    return {
      total: payments.length,
      payments,
    };
  },

  processPayment: async (profile_id:number,
    paymentData: PaymentDto
  ) => {
    try {
      const {
        property_listing_id,
        paymentType,
      } = paymentData;


      const listing =
        await propertyListingRepository.findListingById(
          property_listing_id
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
          profile_id,
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
          profile_id,
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
          property_listing_id,
          client.id
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
            .findAcceptedNegociationByClientAndProperty(
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
            property_listing_id,
          property_id: property.id,
          client_id: client.id,
          owner_id: property.id_owner,
          negociation_id:
            negociation.id,
          payment_type:
            paymentType,
          amount:
            Number(
              negociation.accepted_value
            ),
          pricing,
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
        return createPayment({
          property_listing_id:
            property_listing_id,
          property_id: property.id,
          client_id: client.id,
          owner_id:
            property.id_owner,
          negociation_id:
            null,
          payment_type:
            paymentType,
          amount:
            Number(property.price),
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

  releaseHeldPayment: async (profile_id: number, payment_id: number) => {
    const releaser = await profileRole.findProfileRoleByRole(profile_id, 2);
    if (!releaser) {
      throw new AppError("Apenas proprietarios podem liberar pagamentos!", 403);
    }

    const payment = await PaymentsRepository.findPaymentById(payment_id);
    if (!payment) {
      throw new AppError("Pagamento nao encontrado!", 404);
    }

    if (payment.owner_id !== releaser.id) {
      throw new AppError("Voce nao tem permissao para liberar este pagamento!", 403);
    }

    if (payment.status !== PaymentStatus.HELD) {
      throw new AppError("Apenas pagamentos retidos podem ser liberados!", 400);
    }

    const listing = payment.property_listing;
    const property = listing.property;
    const finalListingStatus =
      property.type_property_purchase === "FOR_RENT"
        ? ListingStatus.ALUGADO
        : ListingStatus.VENDIDO;
    const finalHistoryStatus =
      property.type_property_purchase === "FOR_RENT"
        ? propertySelingStatus.ALUGADO
        : propertySelingStatus.VENDIDO;

    const releasedPayment = await PaymentsRepository.updatePaymentStatus(
      payment_id,
      PaymentStatus.RELEASED,
      {
        released_at: new Date(),
        released_by: releaser.id,
      }
    );

    await propertyListingRepository.updateListingStatus(
      listing.id,
      finalListingStatus,
      new Date()
    );

    await historyPropertyRepository.createHistoryProperty(
      payment.owner_id,
      property.id,
      propertySelingStatus.RESERVADO,
      finalHistoryStatus
    );

    return {
      message: "Pagamento liberado com sucesso!",
      payment: releasedPayment,
    };
  },

  cancelHeldPayment: async (profile_id: number, payment_id: number) => {
    const client = await profileRole.findProfileRoleByRole(profile_id, 1);
    if (!client) {
      throw new AppError("Apenas clientes podem cancelar pagamentos!", 403);
    }

    const payment = await PaymentsRepository.findPaymentById(payment_id);
    if (!payment) {
      throw new AppError("Pagamento nao encontrado!", 404);
    }

    if (payment.client_id !== client.id) {
      throw new AppError("Voce nao tem permissao para cancelar este pagamento!", 403);
    }

    if (payment.status === PaymentStatus.RELEASED) {
      throw new AppError("Nao e possivel cancelar um pagamento ja liberado!", 400);
    }

    if (payment.status === PaymentStatus.CANCELLED) {
      throw new AppError("Este pagamento ja foi cancelado!", 400);
    }

    const cancelledPayment = await PaymentsRepository.updatePaymentStatus(
      payment_id,
      PaymentStatus.CANCELLED,
      {
        cancelled_at: new Date(),
      }
    );

    await propertyListingRepository.updateListingStatus(
      payment.property_listing_id,
      ListingStatus.DISPONIVEL,
      null
    );

    await historyPropertyRepository.createHistoryProperty(
      payment.owner_id,
      payment.property_listing.property.id,
      propertySelingStatus.RESERVADO,
      propertySelingStatus.DISPONIVEL
    );

    return {
      message: "Pagamento cancelado e valor devolvido na simulacao!",
      payment: cancelledPayment,
    };
  },
};


async function getPropertyPricing(
  purchaseType:
    | "FOR_SALE"
    | "FOR_RENT"
): Promise<{ amount: number; model: "PERCENTAGE" | "FIXED" }> {

  const pricingType =
    purchaseType === "FOR_RENT"
      ? PricingType.PROPERTY_RENT
      : PricingType.PROPERTY_SALE;

  const pricing =
    await platformPricingRepository
      .findActivePricingByType(
        pricingType
      );

  return {
    amount: Number(pricing?.amount ?? 5),
    model: pricing?.pricing_model ?? "PERCENTAGE",
  };
}

async function createPayment({
  property_listing_id,
  property_id,
  client_id,
  owner_id,
  negociation_id,
  payment_type,
  amount,
  pricing,
  property_title,
  property_price,
}: {
  property_listing_id: number;
  property_id: number;
  client_id: number;
  owner_id: number;
  negociation_id:
    | number
    | null;
  payment_type:
    PaymentType;
  amount: number;
  pricing: { amount: number; model: "PERCENTAGE" | "FIXED" };
  property_title: string;
  property_price: number;
}) {

  const platform_fee =
    pricing.model === "FIXED"
      ? pricing.amount
      : amount * (pricing.amount / 100);

  if (platform_fee >= amount) {
    throw new AppError("Taxa da plataforma invalida para este pagamento", 400);
  }

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

  await propertyListingRepository.updateListingStatus(
    property_listing_id,
    ListingStatus.RESERVADO
  );

  await historyPropertyRepository.createHistoryProperty(
    owner_id,
    property_id,
    propertySelingStatus.DISPONIVEL,
    propertySelingStatus.RESERVADO
  );

  return {
    message:
      "Pagamento simulado processado e valor retido com sucesso",
    payment,
  };
}
