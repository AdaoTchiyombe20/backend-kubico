import { Router } from "express";
import { paymentsController } from "../../controllers/payments.controller.js";
import { authorizeNormalAccessTokenMiddleware, authorizeRoleAcessTokenMiddleware } from "../../middlewares/auth.middleware.js";

const paymentRoute = Router()

const withRole = (...roles: string[]) => [
  authorizeNormalAccessTokenMiddleware,
  authorizeRoleAcessTokenMiddleware(roles),
];

paymentRoute.post('/', withRole('client'), paymentsController.propertyPayment )
paymentRoute.patch('/:payment_id/release', withRole('owner'), paymentsController.releasePayment )
paymentRoute.patch('/:payment_id/cancel', withRole('client'), paymentsController.cancelPayment )

export {paymentRoute}
