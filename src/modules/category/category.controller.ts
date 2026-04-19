import { Request, Response } from 'express';
import prisma from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response';

// GET /api/categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { ideas: { where: { status: 'APPROVED' } } } },
      },
    });

    return sendSuccess(res, categories);
  } catch (error) {
    console.error('GetCategories error:', error);
    return sendError(res, 'Failed to fetch categories');
  }
};

// POST /api/categories (admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, icon } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return sendError(res, 'Category already exists', 409);
    }

    const category = await prisma.category.create({
      data: { name, slug, icon },
    });

    return sendSuccess(res, category, 'Category created', 201);
  } catch (error) {
    console.error('CreateCategory error:', error);
    return sendError(res, 'Failed to create category');
  }
};
