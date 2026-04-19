import { Request, Response } from 'express';
import prisma from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response';

// GET /api/ideas/:id/comments — Get nested comments
export const getComments = async (req: Request, res: Response) => {
  try {
    const { id: ideaId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { ideaId, parentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                user: { select: { id: true, name: true, avatar: true } },
                replies: {
                  orderBy: { createdAt: 'asc' },
                  include: {
                    user: { select: { id: true, name: true, avatar: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return sendSuccess(res, comments);
  } catch (error) {
    console.error('GetComments error:', error);
    return sendError(res, 'Failed to fetch comments');
  }
};

// POST /api/ideas/:id/comments — Add comment
export const addComment = async (req: Request, res: Response) => {
  try {
    const { id: ideaId } = req.params;
    const userId = req.user!.id;
    const { content, parentId } = req.body;

    if (!content || content.trim().length === 0) {
      return sendError(res, 'Comment content is required', 400);
    }

    // Check idea exists
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea || idea.status !== 'APPROVED') {
      return sendError(res, 'Idea not found or not approved', 404);
    }

    // If parentId, check parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parentComment || parentComment.ideaId !== ideaId) {
        return sendError(res, 'Parent comment not found', 404);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId,
        ideaId,
        parentId: parentId || null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update comment count
    await prisma.idea.update({
      where: { id: ideaId },
      data: { commentCount: { increment: 1 } },
    });

    return sendSuccess(res, comment, 'Comment added', 201);
  } catch (error) {
    console.error('AddComment error:', error);
    return sendError(res, 'Failed to add comment');
  }
};

// DELETE /api/comments/:id — Delete comment (owner or admin)
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return sendError(res, 'Comment not found', 404);
    }

    if (comment.userId !== userId && userRole !== 'ADMIN') {
      return sendError(res, 'You can only delete your own comments', 403);
    }

    // Count replies that will be deleted
    const replyCount = await prisma.comment.count({
      where: { parentId: id },
    });

    await prisma.comment.delete({ where: { id } });

    // Update comment count (comment + its replies)
    await prisma.idea.update({
      where: { id: comment.ideaId },
      data: { commentCount: { decrement: 1 + replyCount } },
    });

    return sendSuccess(res, null, 'Comment deleted');
  } catch (error) {
    console.error('DeleteComment error:', error);
    return sendError(res, 'Failed to delete comment');
  }
};
