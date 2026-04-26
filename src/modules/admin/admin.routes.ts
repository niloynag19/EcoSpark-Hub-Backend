import { Router } from 'express';
import {
  getUsers,
  toggleUser,
  changeUserRole,
  getAdminIdeas,
  approveIdea,
  rejectIdea,
  deleteAdminIdea,
  getAdminStats,
  updateIdeaCategory,
} from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate, requireRole('ADMIN'));

// Stats
router.get('/stats', getAdminStats);

// User management
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUser);
router.patch('/users/:id/role', changeUserRole);

// Idea management
router.get('/ideas', getAdminIdeas);
router.patch('/ideas/:id/approve', approveIdea);
router.patch('/ideas/:id/reject', rejectIdea);
router.patch('/ideas/:id/category', updateIdeaCategory);
router.delete('/ideas/:id', deleteAdminIdea);

export default router;
