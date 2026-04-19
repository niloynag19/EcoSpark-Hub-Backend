import { Request, Response } from 'express';
import prisma from '../../config/db';
import { sendSuccess, sendError } from '../../utils/response';

// POST /api/ideas/:id/vote — Cast or change vote
export const castVote = async (req: Request, res: Response) => {
  try {
    const { id: ideaId } = req.params;
    const userId = req.user!.id;
    const { type } = req.body; // 'UPVOTE' or 'DOWNVOTE'

    if (!['UPVOTE', 'DOWNVOTE'].includes(type)) {
      return sendError(res, 'Vote type must be UPVOTE or DOWNVOTE', 400);
    }

    // Check idea exists and is approved
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    if (!idea || idea.status !== 'APPROVED') {
      return sendError(res, 'Idea not found or not approved', 404);
    }

    // Check existing vote
    const existingVote = await prisma.vote.findUnique({
      where: { userId_ideaId: { userId, ideaId } },
    });

    if (existingVote) {
      if (existingVote.type === type) {
        return sendError(res, 'You already cast this vote. Remove it first.', 400);
      }

      // Change vote direction
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { type },
      });

      // Update counts
      const upDelta = type === 'UPVOTE' ? 1 : -1;
      const downDelta = type === 'DOWNVOTE' ? 1 : -1;

      await prisma.idea.update({
        where: { id: ideaId },
        data: {
          upvoteCount: { increment: upDelta },
          downvoteCount: { increment: downDelta },
        },
      });

      return sendSuccess(res, { type }, 'Vote changed');
    }

    // Create new vote
    await prisma.vote.create({
      data: { type, userId, ideaId },
    });

    // Update idea vote count
    await prisma.idea.update({
      where: { id: ideaId },
      data: {
        upvoteCount: type === 'UPVOTE' ? { increment: 1 } : undefined,
        downvoteCount: type === 'DOWNVOTE' ? { increment: 1 } : undefined,
      },
    });

    return sendSuccess(res, { type }, 'Vote cast successfully', 201);
  } catch (error) {
    console.error('CastVote error:', error);
    return sendError(res, 'Failed to cast vote');
  }
};

// DELETE /api/ideas/:id/vote — Remove vote
export const removeVote = async (req: Request, res: Response) => {
  try {
    const { id: ideaId } = req.params;
    const userId = req.user!.id;

    const existingVote = await prisma.vote.findUnique({
      where: { userId_ideaId: { userId, ideaId } },
    });

    if (!existingVote) {
      return sendError(res, 'No vote found to remove', 404);
    }

    await prisma.vote.delete({ where: { id: existingVote.id } });

    // Update idea vote count
    await prisma.idea.update({
      where: { id: ideaId },
      data: {
        upvoteCount: existingVote.type === 'UPVOTE' ? { decrement: 1 } : undefined,
        downvoteCount: existingVote.type === 'DOWNVOTE' ? { decrement: 1 } : undefined,
      },
    });

    return sendSuccess(res, null, 'Vote removed');
  } catch (error) {
    console.error('RemoveVote error:', error);
    return sendError(res, 'Failed to remove vote');
  }
};

// GET /api/ideas/:id/vote — Get user's vote on an idea
export const getUserVote = async (req: Request, res: Response) => {
  try {
    const { id: ideaId } = req.params;
    const userId = req.user!.id;

    const vote = await prisma.vote.findUnique({
      where: { userId_ideaId: { userId, ideaId } },
    });

    return sendSuccess(res, { vote: vote ? vote.type : null });
  } catch (error) {
    console.error('GetUserVote error:', error);
    return sendError(res, 'Failed to get vote');
  }
};
