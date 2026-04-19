import { Router } from 'express';
import {
  getIdeas,
  getFeaturedIdeas,
  getMyIdeas,
  getIdeaById,
  createIdea,
  updateIdea,
  deleteIdea,
  submitIdea,
} from './idea.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';

const router = Router();

// Public routes
router.get('/', optionalAuth, getIdeas);
router.get('/featured', getFeaturedIdeas);

// Auth required routes
router.get('/my', authenticate, getMyIdeas);
router.post('/', authenticate, upload.array('images', 5), createIdea);
router.put('/:id', authenticate, upload.array('images', 5), updateIdea);
router.delete('/:id', authenticate, deleteIdea);
router.patch('/:id/submit', authenticate, submitIdea);

// This must be last (catch-all param route)
router.get('/:id', optionalAuth, getIdeaById);

export default router;
