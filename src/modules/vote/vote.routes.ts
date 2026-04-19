import { Router } from 'express';
import { castVote, removeVote, getUserVote } from './vote.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/:id/vote', authenticate, castVote);
router.delete('/:id/vote', authenticate, removeVote);
router.get('/:id/vote', authenticate, getUserVote);

export default router;
