import { Request, Response } from 'express';
import prisma from '../../config/db';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response';

// GET /api/admin/users — List all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { ideas: true, votes: true, comments: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return sendPaginated(res, users, total, page, limit);
  } catch (error) {
    console.error('GetUsers error:', error);
    return sendError(res, 'Failed to fetch users');
  }
};

// PATCH /api/admin/users/:id/toggle — Activate/deactivate user
export const toggleUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Don't allow deactivating yourself
    if (user.id === req.user!.id) {
      return sendError(res, 'Cannot deactivate your own account', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return sendSuccess(
      res,
      updated,
      `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    console.error('ToggleUser error:', error);
    return sendError(res, 'Failed to toggle user status');
  }
};

// PATCH /api/admin/users/:id/role — Change user role
export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;

    if (!['MEMBER', 'ADMIN'].includes(role)) {
      return sendError(res, 'Role must be MEMBER or ADMIN', 400);
    }

    // Don't allow changing your own role
    if (id === req.user!.id) {
      return sendError(res, 'Cannot change your own role', 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return sendSuccess(res, updated, `User role changed to ${role}`);
  } catch (error) {
    console.error('ChangeUserRole error:', error);
    return sendError(res, 'Failed to change user role');
  }
};

// GET /api/admin/ideas — Get all ideas (all statuses)
export const getAdminIdeas = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          images: true,
          isPaid: true,
          price: true,
          status: true,
          adminFeedback: true,
          upvoteCount: true,
          downvoteCount: true,
          commentCount: true,
          createdAt: true,
          author: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          category: {
            select: { id: true, name: true, slug: true, icon: true },
          },
        },
      }),
      prisma.idea.count({ where }),
    ]);

    return sendPaginated(res, ideas, total, page, limit);
  } catch (error) {
    console.error('GetAdminIdeas error:', error);
    return sendError(res, 'Failed to fetch ideas');
  }
};

// PATCH /api/admin/ideas/:id/approve — Approve idea
export const approveIdea = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
      return sendError(res, 'Idea not found', 404);
    }

    if (idea.status !== 'UNDER_REVIEW') {
      return sendError(res, 'Only ideas under review can be approved', 400);
    }

    const updated = await prisma.idea.update({
      where: { id },
      data: { status: 'APPROVED', adminFeedback: null },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return sendSuccess(res, updated, 'Idea approved successfully');
  } catch (error) {
    console.error('ApproveIdea error:', error);
    return sendError(res, 'Failed to approve idea');
  }
};

// PATCH /api/admin/ideas/:id/reject — Reject idea with feedback
export const rejectIdea = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { feedback } = req.body;

    if (!feedback || feedback.trim().length === 0) {
      return sendError(res, 'Feedback is required when rejecting an idea', 400);
    }

    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
      return sendError(res, 'Idea not found', 404);
    }

    if (idea.status !== 'UNDER_REVIEW') {
      return sendError(res, 'Only ideas under review can be rejected', 400);
    }

    const updated = await prisma.idea.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminFeedback: feedback.trim(),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return sendSuccess(res, updated, 'Idea rejected with feedback');
  } catch (error) {
    console.error('RejectIdea error:', error);
    return sendError(res, 'Failed to reject idea');
  }
};

// DELETE /api/admin/ideas/:id — Delete any idea
export const deleteAdminIdea = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
      return sendError(res, 'Idea not found', 404);
    }

    await prisma.idea.delete({ where: { id } });

    return sendSuccess(res, null, 'Idea deleted successfully');
  } catch (error) {
    console.error('DeleteAdminIdea error:', error);
    return sendError(res, 'Failed to delete idea');
  }
};

// PATCH /api/admin/ideas/:id/category — Change idea category
export const updateIdeaCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { categoryId } = req.body;

    if (!categoryId) {
      return sendError(res, 'Category ID is required', 400);
    }

    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
      return sendError(res, 'Idea not found', 404);
    }

    const updated = await prisma.idea.update({
      where: { id },
      data: { categoryId },
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true } },
      },
    });

    return sendSuccess(res, updated, 'Idea category updated successfully');
  } catch (error) {
    console.error('UpdateIdeaCategory error:', error);
    return sendError(res, 'Failed to update idea category');
  }
};

// GET /api/admin/stats — Dashboard stats
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalIdeas,
      underReview,
      approved,
      rejected,
      drafts,
      totalComments,
      totalVotes,
      newsletters,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.idea.count(),
      prisma.idea.count({ where: { status: 'UNDER_REVIEW' } }),
      prisma.idea.count({ where: { status: 'APPROVED' } }),
      prisma.idea.count({ where: { status: 'REJECTED' } }),
      prisma.idea.count({ where: { status: 'DRAFT' } }),
      prisma.comment.count(),
      prisma.vote.count(),
      prisma.newsletter.count(),
    ]);

    return sendSuccess(res, {
      totalUsers,
      totalIdeas,
      underReview,
      approved,
      rejected,
      drafts,
      totalComments,
      totalVotes,
      newsletters,
    });
  } catch (error) {
    console.error('GetAdminStats error:', error);
    return sendError(res, 'Failed to fetch stats');
  }
};
