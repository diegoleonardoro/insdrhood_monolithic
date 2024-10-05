import express, { NextFunction, Request, Response } from "express";
import { createCheckoutSession, stripeWebhooks, handleCheckoutSuccess } from "../controllers/payments";

const router = express.Router();
router.post('/create-checkout-session', createCheckoutSession);
router.post('/webhook', stripeWebhooks);
router.get('/handle-checkout-success', handleCheckoutSuccess);

export { router as payments }