import express, { NextFunction, Request, Response } from "express";
import { createCheckoutSession } from "../controllers/payments";

const router = express.Router();


router.post('/create-checkout-session', createCheckoutSession);

// app.post('/create-payment-intent', paymentIntent);


export {router as payments}