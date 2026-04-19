import { Router } from 'express';
import { subscribe } from './newsletter.controller';

const router = Router();

router.post('/', subscribe);

export default router;
