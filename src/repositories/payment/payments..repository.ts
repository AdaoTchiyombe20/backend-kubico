import type { payments, PaymentStatus, PaymentType, Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

export type PaymentWithListing = Prisma.paymentsGetPayload<{
    include: {
        property_listing: {
            include: {
                property: true;
            };
        };
    };
}>;

export const PaymentsRepository = {
    createPayments: async(property_listing_id: number, client_id: number, owner_id: number, negociation_id: number | null, payment_type: PaymentType, amount: number, platform_fee: number, released_amount: number, payment_status:PaymentStatus, property_title: string, property_price: number ): Promise<payments> => {
        return await prisma.payments.create({
            data : {
                property_listing_id,
                client_id, 
                owner_id, 
                negociation_id,
                payment_type, 
                platform_fee, 
                released_amount,
                amount,
                status: payment_status,
                property_title,
                property_price,
                paid_at: payment_status === "HELD" ? new Date() : null,
             }
        })
    }, 
    findActivePayment: async(listed_property_id: number, client_id: number): Promise<payments | null> => {
        return await prisma.payments.findFirst({
            where: {
                property_listing_id: listed_property_id,
                client_id,
                status: {
                    in: ["PENDING", "HELD"],
                },
            }
        })
    },
    findPaymentById: async(payment_id: number): Promise<PaymentWithListing | null> => {
        return await prisma.payments.findUnique({
            where: { id: payment_id },
            include: {
                property_listing: {
                    include: {
                        property: true,
                    },
                },
            },
        })
    },
    updatePaymentStatus: async(
        payment_id: number,
        status: PaymentStatus,
        data?: {
            released_by?: number | null;
            released_at?: Date | null;
            cancelled_at?: Date | null;
        }
    ): Promise<PaymentWithListing> => {
        return await prisma.payments.update({
            where: { id: payment_id },
            data: {
                status,
                updated_at: new Date(),
                ...data,
            },
            include: {
                property_listing: {
                    include: {
                        property: true,
                    },
                },
            },
        })
    },
}
