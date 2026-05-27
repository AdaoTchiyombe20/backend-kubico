import { Router } from "express";
import { negociationEventController } from "../../controllers/negociationEvent.controller.js";
import { authorizeNormalAccessTokenMiddleware, authorizeRoleAcessTokenMiddleware  } from "../../middlewares/auth.middleware.js";

const withRole = (...roles: string[]) => [
  authorizeNormalAccessTokenMiddleware,
  authorizeRoleAcessTokenMiddleware(roles),
];

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
withRole("client"),
    negociationEventController.initNegociationEvent
);

/**
 * POST /api/negotiations/accept
 * Aceitar uma proposta (apenas proprietário)
 * Body: { negociation_id, accepted_value, message? }
 */
negociationRouter.post(
    "/accept",
    withRole("owner"),
    negociationEventController.acceptNegociation
);

/**
 * POST /api/negotiations/reject
 * Rejeitar uma proposta (apenas proprietário)
 * Body: { negociation_id, message? }
 */
negociationRouter.post(
    "/reject",
    withRole("owner"),
    negociationEventController.rejectNegociation
);

/**
 * POST /api/negotiations/counter-offer
 * Enviar contraproposta (apenas proprietário)
 * Body: { negociation_id, counter_price, message? }
 */
negociationRouter.post(
    "/counter-offer",
    withRole("owner"),
    negociationEventController.sendCounterOffer
);

/**
 * POST /api/negotiations/cancel
 * Cancelar uma negociação
 * Body: { negociation_id, message? }
 */
negociationRouter.post(
    "/cancel",
    withRole("client"),
    negociationEventController.cancelNegociation
);

/**
 * GET /api/negotiations/:negociation_id/history
 * Obter histórico de eventos de uma negociação
 * Params: negociation_id
 */
negociationRouter.get(
    "/:negociation_id/history",
    withRole("client", "owner"),
    negociationEventController.getNegociationHistory
);

/**
 * GET /api/negotiations
 * Listar todas as negociações do usuário
 */
negociationRouter.get(
    "/",
    withRole("client", "owner"),
    negociationEventController.getUserNegotiations
);


negociationRouter.get(
    "/sentProposals",
    withRole("client"),
    negociationEventController.getSentProposals
);
negociationRouter.get(
    "/sentProposals/:property_id",
    withRole("client"),
    negociationEventController.getSentProposals
);
negociationRouter.get(
    "/receivedProposals",
    withRole("owner"),
    negociationEventController.getReceivedProposals
);
negociationRouter.get(
    "/receivedProposals/:property_id",
    withRole("owner"),
    negociationEventController.getReceivedProposals
);

/**
 * GET /api/negotiations/pending
 * Listar negociações pendentes (para proprietários)
 */
negociationRouter.get(
    "/pending",
    withRole("owner"),
    negociationEventController.getPendingNegotiations
);

export { negociationRouter };
