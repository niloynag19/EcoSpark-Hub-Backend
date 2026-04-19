import { Request, Response } from 'express';
import prisma from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response';

// POST /api/newsletter — Subscribe
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendError(res, 'Valid email is required', 400);
    }

    const existing = await prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      return sendError(res, 'This email is already subscribed', 409);
    }

    await prisma.newsletter.create({ data: { email } });

    return sendSuccess(res, null, 'Successfully subscribed to newsletter', 201);
  } catch (error) {
    console.error('Subscribe error:', error);
    return sendError(res, 'Failed to subscribe');
  }
};
