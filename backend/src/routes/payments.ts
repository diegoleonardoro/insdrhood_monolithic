import express, { NextFunction, Request, Response } from "express";
import { createCheckoutSession, stripeWebhooks } from "../controllers/payments";

const router = express.Router();
router.post('/create-checkout-session', createCheckoutSession);
router.post('/webhook', stripeWebhooks);

export { router as payments }