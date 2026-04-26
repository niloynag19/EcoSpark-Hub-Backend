import { Router } from 'express';
import { createPaymentIntent, confirmPayment, checkPayment, getMyPayments } from './payment.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/confirm', authenticate, confirmPayment);
router.get('/check/:ideaId', authenticate, checkPayment);
router.get('/my-purchases', authenticate, getMyPayments);

export default router;
