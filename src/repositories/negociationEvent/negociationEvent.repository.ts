import { prisma } from "../../../lib/prisma.js";
import type { negociationEvent, NegociationEventType } from "@prisma/client";

export const negociationEventRepository = {
    // ============================================
    // CREATE - Criar evento de negociação
    // ============================================

    createNegociationEvent: async (
        profile_role_id: number,
        negociation_id: number,
        event_type: NegociationEventType,
        event_description: string
    ): Promise<negociationEvent> => {
        return await prisma.negociationEvent.create({
            data: {
                negociation_id,
                profile_role_id,
                event_type,
                event_description,
            },
        });
    },

    // ============================================
    // READ - Encontrar evento por ID
    // ============================================

    findEventById: async (id: number): Promise<negociationEvent | null> => {
        return await prisma.negociationEvent.findUnique({
            where: { id },
        });
    },

    // ============================================
    // READ - Encontrar todos os eventos de uma negociação
    // ============================================

    findNegociationHistory: async (negociation_id: number): Promise<negociationEvent[]> => {
        return await prisma.negociationEvent.findMany({
            where: { negociation_id },
            include: {
                profile_roles: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { event_date: "asc" },
        });
    },

    // ============================================
    // READ - Encontrar último evento de uma negociação
    // ============================================

    findLastEvent: async (negociation_id: number): Promise<negociationEvent | null> => {
        return await prisma.negociationEvent.findFirst({
            where: { negociation_id },
            orderBy: { event_date: "desc" },
        });
    },

    // ============================================
    // READ - Encontrar eventos por tipo
    // ============================================

    findEventsByType: async (
        negociation_id: number,
        event_type: NegociationEventType
    ): Promise<negociationEvent[]> => {
        return await prisma.negociationEvent.findMany({
            where: {
                negociation_id,
                event_type,
            },
            orderBy: { event_date: "desc" },
        });
    },

    // ============================================
    // READ - Contar eventos de um tipo específico
    // ============================================

    countEventsByType: async (
        negociation_id: number,
        event_type: NegociationEventType
    ): Promise<number> => {
        return await prisma.negociationEvent.count({
            where: {
                negociation_id,
                event_type,
            },
        });
    },

    // ============================================
    // READ - Encontrar todos os eventos de um usuário
    // ============================================

    findUserEvents: async (profile_role_id: number): Promise<negociationEvent[]> => {
        return await prisma.negociationEvent.findMany({
            where: { profile_role_id },
            include: {
                negociation: {
                    select: {
                        id: true,
                        status: true,
                        property_listing: {
                            select: {
                                id: true,
                                properties: {
                                    select: {id: true, title: true },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { event_date: "desc" },
        });
    },

    // ============================================
    // READ - Encontrar eventos recentes
    // ============================================

    findRecentEvents: async (negociation_id: number, limit: number = 10): Promise<negociationEvent[]> => {
        return await prisma.negociationEvent.findMany({
            where: { negociation_id },
            include: {
                profile_roles: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { event_date: "desc" },
            take: limit,
        });
    },

    // ============================================
    // DELETE - Deletar evento (raramente usado)
    // ============================================

    deleteEvent: async (id: number): Promise<negociationEvent> => {
        return await prisma.negociationEvent.delete({
            where: { id },
        });
    },
};