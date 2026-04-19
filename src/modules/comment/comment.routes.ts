import { Router } from 'express';
import { getComments, addComment, deleteComment } from './comment.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Comments nested under ideas
router.get('/ideas/:id/comments', getComments);
router.post('/ideas/:id/comments', authenticate, addComment);
router.delete('/comments/:id', authenticate, deleteComment);

export default router;
