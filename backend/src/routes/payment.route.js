import express from "express";
import { paymentController } from "../controllers/payment.controller.js";

const paymentRoute = express.Router();

paymentRoute.post("/payments", paymentController.initiatePayment);
paymentRoute.post("/payments/webhook", paymentController.handlePaymentWebhook);
paymentRoute.get("/payments/stream/:registrationId", paymentController.streamEvents);

export { paymentRoute };
