import { Router } from "express";
import { negociationEventController } from "../../controllers/negociationEvent.controller.js";

const negociationRouter = Router();

// ============================================
// ROTAS PÚBLICAS (com autenticação)
// ============================================

/**
 * POST /api/negotiations/init
 * Iniciar uma negociação (criar proposta)
 * Body: { property_id, offer_price, message? }
 */
negociationRouter.post(
    "/init",
    negociationEventController.initNegociationEvent
);

/**
 * POST /api/negotiations/accept
 * Aceitar uma proposta (apenas proprietário)
 * Body: { negociation_id, accepted_value, message? }
 */
negociationRouter.post(
    "/accept",
    negociationEventController.acceptNegociation
);

/**
 * POST /api/negotiations/reject
 * Rejeitar uma proposta (apenas proprietário)
 * Body: { negociation_id, message? }
 */
negociationRouter.post(
    "/reject",
    negociationEventController.rejectNegociation
);

/**
 * POST /api/negotiations/counter-offer
 * Enviar contraproposta (apenas proprietário)
 * Body: { negociation_id, counter_price, message? }
 */
negociationRouter.post(
    "/counter-offer",
    negociationEventController.sendCounterOffer
);

/**
 * POST /api/negotiations/cancel
 * Cancelar uma negociação
 * Body: { negociation_id, message? }
 */
negociationRouter.post(
    "/cancel",
    negociationEventController.cancelNegociation
);

/**
 * GET /api/negotiations/:negociation_id/history
 * Obter histórico de eventos de uma negociação
 * Params: negociation_id
 */
negociationRouter.get(
    "/:negociation_id/history",
    negociationEventController.getNegociationHistory
);

/**
 * GET /api/negotiations
 * Listar todas as negociações do usuário
 */
negociationRouter.get(
    "/",
    negociationEventController.getUserNegotiations
);

/**
 * GET /api/negotiations/pending
 * Listar negociações pendentes (para proprietários)
 */
negociationRouter.get(
    "/pending",
    negociationEventController.getPendingNegotiations
);

export { negociationRouter };