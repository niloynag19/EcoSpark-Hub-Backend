import { Request, Response } from 'express';
import prisma from '../../config/db';
import cloudinary from '../../config/cloudinary';
import { sendSuccess, sendError, sendPaginated } from '../../utils/response';
import { generateSlug } from '../../utils/slug';
import { Prisma } from '@prisma/client';

// Upload images to Cloudinary
const uploadToCloudinary = async (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'ecospark-hub/ideas', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

// GET /api/ideas — List approved ideas (public, paginated)
export const getIdeas = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const category = req.query.category as string;
    const sort = (req.query.sort as string) || 'recent';
    const paymentFilter = req.query.payment as string;

    // Build where clause
    const where: Prisma.IdeaWhereInput = {
      status: 'APPROVED',
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { problemStatement: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (paymentFilter === 'free') {
      where.isPaid = false;
    } else if (paymentFilter === 'paid') {
      where.isPaid = true;
    }

    // Build sort
    let orderBy: Prisma.IdeaOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'top-voted') {
      orderBy = { upvoteCount: 'desc' };
    } else if (sort === 'most-commented') {
      orderBy = { commentCount: 'desc' };
    }

    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          images: true,
          isPaid: true,
          price: true,
          status: true,
          upvoteCount: true,
          downvoteCount: true,
          commentCount: true,
          createdAt: true,
          author: {
            select: { id: true, name: true, avatar: true },
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
    console.error('GetIdeas error:', error);
    return sendError(res, 'Failed to fetch ideas');
  }
};

// GET /api/ideas/featured — Top 3 by votes
export const getFeaturedIdeas = async (req: Request, res: Response) => {
  try {
    const ideas = await prisma.idea.findMany({
      where: { status: 'APPROVED' },
      orderBy: { upvoteCount: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        images: true,
        isPaid: true,
        price: true,
        upvoteCount: true,
        downvoteCount: true,
        commentCount: true,
        createdAt: true,
        author: {
          select: { id: true, name: true, avatar: true },
        },
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
      },
    });

    return sendSuccess(res, ideas);
  } catch (error) {
    console.error('GetFeaturedIdeas error:', error);
    return sendError(res, 'Failed to fetch featured ideas');
  }
};

// GET /api/ideas/my — Current user's ideas
export const getMyIdeas = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const status = req.query.status as string;

    const where: Prisma.IdeaWhereInput = { authorId: userId };
    if (status) {
      where.status = status as any;
    }

    const ideas = await prisma.idea.findMany({
      where,
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
        updatedAt: true,
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
      },
    });

    return sendSuccess(res, ideas);
  } catch (error) {
    console.error('GetMyIdeas error:', error);
    return sendError(res, 'Failed to fetch your ideas');
  }
};

// GET /api/ideas/:id — Single idea detail
export const getIdeaById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const idea = await prisma.idea.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        problemStatement: true,
        proposedSolution: true,
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
        updatedAt: true,
        authorId: true,
        author: {
          select: { id: true, name: true, avatar: true, bio: true },
        },
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
      },
    });

    if (!idea) {
      return sendError(res, 'Idea not found', 404);
    }

    // If idea is paid and user hasn't paid, hide full content
    if (idea.isPaid && idea.status === 'APPROVED') {
      const userId = req.user?.id;

      // Author can always see their own idea
      if (userId && userId === idea.authorId) {
        return sendSuccess(res, { ...idea, hasAccess: true });
      }

      // Admin can always see
      if (req.user?.role === 'ADMIN') {
        return sendSuccess(res, { ...idea, hasAccess: true });
      }

      // Check if user has paid
      if (userId) {
        const payment = await prisma.payment.findUnique({
          where: {
            userId_ideaId: { userId, ideaId: idea.id },
          },
        });
        if (payment && payment.status === 'succeeded') {
          return sendSuccess(res, { ...idea, hasAccess: true });
        }
      }

      // Hide full content for unpaid users
      return sendSuccess(res, {
        ...idea,
        problemStatement: idea.problemStatement.substring(0, 150) + '...',
        proposedSolution: 'Unlock this idea to see the proposed solution.',
        description: idea.description.substring(0, 200) + '...',
        hasAccess: false,
      });
    }

    return sendSuccess(res, { ...idea, hasAccess: true });
  } catch (error) {
    console.error('GetIdeaById error:', error);
    return sendError(res, 'Failed to fetch idea');
  }
};

// POST /api/ideas — Create idea
export const createIdea = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, problemStatement, proposedSolution, description, categoryId, isPaid, price } = req.body;

    // Upload images if provided
    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      const uploadPromises = (req.files as Express.Multer.File[]).map(uploadToCloudinary);
      imageUrls = await Promise.all(uploadPromises);
    }

    const slug = generateSlug(title);

    const idea = await prisma.idea.create({
      data: {
        title,
        slug,
        problemStatement,
        proposedSolution,
        description,
        images: imageUrls,
        isPaid: isPaid || false,
        price: isPaid ? price : null,
        status: 'DRAFT',
        authorId: userId,
        categoryId,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true, slug: true, icon: true } },
      },
    });

    return sendSuccess(res, idea, 'Idea created successfully', 201);
  } catch (error) {
    console.error('CreateIdea error:', error);
    return sendError(res, 'Failed to create idea');
  }
};

// PUT /api/ideas/:id — Update idea (only unpublished)
export const updateIdea = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const existingIdea = await prisma.idea.findUnique({ where: { id } });
    if (!existingIdea) {
      return sendError(res, 'Idea not found', 404);
    }

    if (existingIdea.authorId !== userId) {
      return sendError(res, 'You can only edit your own ideas', 403);
    }

    if (existingIdea.status === 'APPROVED') {
      return sendError(res, 'Cannot edit a published idea', 400);
    }

    // Upload new images if provided
    let imageUrls = existingIdea.images;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadPromises = (req.files as Express.Multer.File[]).map(uploadToCloudinary);
      const newUrls = await Promise.all(uploadPromises);
      imageUrls = [...imageUrls, ...newUrls];
    }

    const updateData: any = { ...req.body, images: imageUrls };
    if (req.body.title) {
      updateData.slug = generateSlug(req.body.title);
    }
    // Reset status to DRAFT if it was rejected
    if (existingIdea.status === 'REJECTED') {
      updateData.status = 'DRAFT';
      updateData.adminFeedback = null;
    }

    const idea = await prisma.idea.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        category: { select: { id: true, name: true, slug: true, icon: true } },
      },
    });

    return sendSuccess(res, idea, 'Idea updated successfully');
  } catch (error) {
    console.error('UpdateIdea error:', error);
    return sendError(res, 'Failed to update idea');
  }
};

// DELETE /api/ideas/:id — Delete idea (only unpublished)
export const deleteIdea = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
      return sendError(res, 'Idea not found', 404);
    }

    if (idea.authorId !== userId && req.user!.role !== 'ADMIN') {
      return sendError(res, 'You can only delete your own ideas', 403);
    }

    if (idea.status === 'APPROVED' && req.user!.role !== 'ADMIN') {
      return sendError(res, 'Cannot delete a published idea', 400);
    }

    await prisma.idea.delete({ where: { id } });

    return sendSuccess(res, null, 'Idea deleted successfully');
  } catch (error) {
    console.error('DeleteIdea error:', error);
    return sendError(res, 'Failed to delete idea');
  }
};

// PATCH /api/ideas/:id/submit — Submit for review
export const submitIdea = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
      return sendError(res, 'Idea not found', 404);
    }

    if (idea.authorId !== userId) {
      return sendError(res, 'You can only submit your own ideas', 403);
    }

    if (idea.status !== 'DRAFT' && idea.status !== 'REJECTED') {
      return sendError(res, 'Only draft or rejected ideas can be submitted for review', 400);
    }

    const updated = await prisma.idea.update({
      where: { id },
      data: { status: 'UNDER_REVIEW', adminFeedback: null },
    });

    return sendSuccess(res, updated, 'Idea submitted for review');
  } catch (error) {
    console.error('SubmitIdea error:', error);
    return sendError(res, 'Failed to submit idea');
  }
};
