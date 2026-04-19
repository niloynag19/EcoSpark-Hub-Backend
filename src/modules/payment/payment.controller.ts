import { Request, Response } from 'express';
import prisma from '../../config/db';
import stripe from '../../config/stripe';
import { sendSuccess, sendError } from '../../utils/response';

// POST /api/payments/create-intent — Create Stripe PaymentIntent
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { ideaId } = req.body;

    if (!ideaId) {
      return sendError(res, 'Idea ID is required', 400);
    }

    // Check idea exists and is paid
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea) {
      return sendError(res, 'Idea not found', 404);
    }

    if (!idea.isPaid || !idea.price) {
      return sendError(res, 'This idea is free', 400);
    }

    // Check if already paid
    const existingPayment = await prisma.payment.findUnique({
      where: { userId_ideaId: { userId, ideaId } },
    });

    if (existingPayment && existingPayment.status === 'succeeded') {
      return sendError(res, 'You already have access to this idea', 400);
    }

    // Create Stripe PaymentIntent
    const amount = Math.round(Number(idea.price) * 100); // Convert to cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { userId, ideaId, ideaTitle: idea.title },
    });

    return sendSuccess(res, {
      clientSecret: paymentIntent.client_secret,
      amount: Number(idea.price),
      ideaTitle: idea.title,
    });
  } catch (error) {
    console.error('CreatePaymentIntent error:', error);
    return sendError(res, 'Failed to create payment intent');
  }
};

// POST /api/payments/confirm — Confirm and record payment
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { paymentIntentId, ideaId } = req.body;

    if (!paymentIntentId || !ideaId) {
      return sendError(res, 'Payment Intent ID and Idea ID are required', 400);
    }

    // Verify with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return sendError(res, 'Payment has not been completed', 400);
    }

    // Record payment
    const payment = await prisma.payment.upsert({
      where: { userId_ideaId: { userId, ideaId } },
      update: {
        status: 'succeeded',
        stripePaymentId: paymentIntentId,
        amount: paymentIntent.amount / 100,
      },
      create: {
        userId,
        ideaId,
        amount: paymentIntent.amount / 100,
        stripePaymentId: paymentIntentId,
        status: 'succeeded',
      },
    });

    return sendSuccess(res, payment, 'Payment confirmed. You now have access to this idea.');
  } catch (error) {
    console.error('ConfirmPayment error:', error);
    return sendError(res, 'Failed to confirm payment');
  }
};

// GET /api/payments/check/:ideaId — Check access
export const checkPayment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { ideaId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { userId_ideaId: { userId, ideaId } },
    });

    const hasAccess = payment?.status === 'succeeded';

    return sendSuccess(res, { hasAccess });
  } catch (error) {
    console.error('CheckPayment error:', error);
    return sendError(res, 'Failed to check payment');
  }
};
