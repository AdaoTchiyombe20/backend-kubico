import type { payments, PaymentStatus, PaymentType } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";

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
                property_price
             }
        })
    }, 
    findActivePayment: async(listed_property_id: number, client_id: number): Promise<payments | null> => {
        return await prisma.payments.findFirst({
            where: {
                property_listing_id: listed_property_id,
                client_id,
                status: "PENDING"
            }
        })
    }
}