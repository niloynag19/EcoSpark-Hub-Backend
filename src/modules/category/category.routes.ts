import { Router } from 'express';
import { getCategories, createCategory } from './category.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticate, requireRole('ADMIN'), createCategory);

export default router;
