import { prisma } from "../../../lib/prisma.js";
import type { negociation, NegociationStatus } from "@prisma/client";

export const negociationRepository = {
    // ============================================
    // CREATE - Criar negociação
    // ============================================

    createNegociation: async (
        client_id: number,
        owner_id: number,
        property_listing_id: number,
        proposed_price: number,
        message: string | null
    ): Promise<negociation> => {
        return await prisma.negociation.create({
            data: {
                client_id,
                owner_id,
                property_listing_id,
                status: "PENDING",
                proposed_price,
                message,
            },
        });
    },

    // ============================================
    // READ - Encontrar por ID
    // ============================================

    findNegociationById: async (id: number): Promise<negociation | null> => {
        return await prisma.negociation.findUnique({
            where: { id },
            include: {
                client: {
                    select: { id: true, name: true },
                },
                owner: {
                    select: { id: true, name: true },
                },
                negociationEvents: {
                    orderBy: { event_date: "asc" },
                },
            },
        });
    },

    // ============================================
    // READ - Encontrar por cliente e propriedade
    // ============================================

    findNegociationByClientAndProperty: async (
        client_id: number,
        property_listing_id: number
    ): Promise<negociation | null> => {
        return await prisma.negociation.findFirst({
            where: {
                client_id,
                property_listing_id,
            },
        });
    },

    // ============================================
    // READ - Encontrar todas as negociações de um usuário
    // ============================================

    findUserNegotiations: async (profile_role_id: number): Promise<negociation[]> => {
        return await prisma.negociation.findMany({
            where: {
                OR: [
                    { client_id: profile_role_id },
                    { owner_id: profile_role_id },
                ],
            },
            include: {
                client: {
                    select: { id: true, name: true },
                },
                owner: {
                    select: { id: true, name: true },
                },
                property_listing: {
                    select: { id: true, title: true, price: true },
                },
                negociationEvents: {
                    orderBy: { event_date: "desc" },
                    take: 1,
                },
            },
            orderBy: { created_at: "desc" },
        });
    },

    // ============================================
    // READ - Encontrar negociações pendentes de um proprietário
    // ============================================

    findPendingNegotiationsByOwner: async (owner_id: number): Promise<negociation[]> => {
        return await prisma.negociation.findMany({
            where: {
                owner_id,
                status: "PENDING",
            },
            include: {
                client: {
                    select: { id: true, name: true },
                },
                property_listing: {
                    select: { id: true, title: true, price: true },
                },
                negociationEvents: {
                    orderBy: { event_date: "desc" },
                    take: 1,
                },
            },
            orderBy: { created_at: "desc" },
        });
    },

    // ============================================
    // UPDATE - Atualizar status da negociação
    // ============================================

    updateNegociationStatus: async (
        negociation_id: number,
        status: NegociationStatus
    ): Promise<negociation> => {
        return await prisma.negociation.update({
            where: { id: negociation_id },
            data: { status },
        });
    },

    // ============================================
    // UPDATE - Aceitar proposta
    // ============================================

    acceptNegociation: async (
        negociation_id: number,
        accepted_value: number
    ): Promise<negociation> => {
        return await prisma.negociation.update({
            where: { id: negociation_id },
            data: {
                status: "ACCEPTED",
                accepted_value,
            },
        });
    },

    // ============================================
    // DELETE - Deletar negociação (soft delete com cancelamento)
    // ============================================

    cancelNegociation: async (negociation_id: number): Promise<negociation> => {
        return await prisma.negociation.update({
            where: { id: negociation_id },
            data: {
                status: "CANCELLED",
            },
        });
    },

    // ============================================
    // READ - Verificar se negociação pertence ao usuário
    // ============================================

    verifyNegociationOwnership: async (
        negociation_id: number,
        profile_role_id: number
    ): Promise<boolean> => {
        const negociation = await prisma.negociation.findUnique({
            where: { id: negociation_id },
        });

        return (
            negociation?.client_id === profile_role_id ||
            negociation?.owner_id === profile_role_id
        );
    },

    // ============================================
    // READ - Verificar se é o proprietário
    // ============================================

    isNegociationOwner: async (
        negociation_id: number,
        profile_role_id: number
    ): Promise<boolean> => {
        const negociation = await prisma.negociation.findUnique({
            where: { id: negociation_id },
        });

        return negociation?.owner_id === profile_role_id;
    },

    // ============================================
    // READ - Verificar se é o cliente
    // ============================================

    isNegociationClient: async (
        negociation_id: number,
        profile_role_id: number
    ): Promise<boolean> => {
        const negociation = await prisma.negociation.findUnique({
            where: { id: negociation_id },
        });

        return negociation?.client_id === profile_role_id;
    },
};