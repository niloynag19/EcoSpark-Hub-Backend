import { z } from 'zod';

export const createIdeaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  problemStatement: z.string().min(20, 'Problem statement must be at least 20 characters'),
  proposedSolution: z.string().min(20, 'Proposed solution must be at least 20 characters'),
  description: z.string().min(30, 'Description must be at least 30 characters'),
  categoryId: z.string().uuid('Invalid category'),
  isPaid: z.boolean().optional().default(false),
  price: z.number().positive('Price must be positive').optional(),
});

export const updateIdeaSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  problemStatement: z.string().min(20).optional(),
  proposedSolution: z.string().min(20).optional(),
  description: z.string().min(30).optional(),
  categoryId: z.string().uuid().optional(),
  isPaid: z.boolean().optional(),
  price: z.number().positive().optional().nullable(),
});

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;
