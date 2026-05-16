import { Request, Response } from 'express';
import { z } from 'zod';
import * as cardsDb from '../db/cards';
import { computeReview } from '../services/retention';
import { ReviewPerformance } from '../types';
import { asyncHandler } from '../middleware/asyncHandler';

const VALID_PERFORMANCES: ReviewPerformance[] = ['forgot', 'struggled', 'gotit', 'mastered'];

const MAX_TITLE_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 50;
const MAX_CONTENT_LENGTH = 10000;

// M3: Strict schemas — `.strict()` rejects unknown keys (defense against
// mass assignment) and the per-field rules replace the old manual length
// checks in one pass.
const CardCreate = z
  .object({
    title: z.string().min(1).max(MAX_TITLE_LENGTH),
    content: z.string().min(1).max(MAX_CONTENT_LENGTH),
    category: z.string().max(MAX_CATEGORY_LENGTH).optional(),
  })
  .strict();

const CardUpdate = z
  .object({
    title: z.string().min(1).max(MAX_TITLE_LENGTH).optional(),
    content: z.string().min(1).max(MAX_CONTENT_LENGTH).optional(),
    category: z.string().max(MAX_CATEGORY_LENGTH).optional(),
  })
  .strict()
  .refine((v) => v.title !== undefined || v.content !== undefined || v.category !== undefined, {
    message: 'At least one field (title, category, content) is required',
  });

function badRequest(res: Response, message: string): void {
  res.status(400).json({ message, status: 400 });
}

export const getCards = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const cards = await cardsDb.findAllByUserId(req.params.userId);
  res.json(cards);
});

export const getDueCards = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const cards = await cardsDb.findDueByUserId(req.params.userId);
  res.json(cards);
});

export const createCard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = CardCreate.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? 'Invalid request body');
    return;
  }

  const card = await cardsDb.create(req.params.userId, parsed.data);
  res.status(201).json(card);
});

export const updateCard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = CardUpdate.safeParse(req.body);
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? 'Invalid request body');
    return;
  }

  const card = await cardsDb.update(req.params.id, req.params.userId, parsed.data);
  if (!card) {
    res.status(404).json({ message: 'Card not found', status: 404 });
    return;
  }

  res.json(card);
});

export const deleteCard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const deleted = await cardsDb.remove(req.params.id, req.params.userId);
  if (!deleted) {
    res.status(404).json({ message: 'Card not found', status: 404 });
    return;
  }

  res.status(204).end();
});

export const reviewCard = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { performance } = req.body ?? {};

  if (!performance || !VALID_PERFORMANCES.includes(performance)) {
    badRequest(res, `Invalid performance. Must be one of: ${VALID_PERFORMANCES.join(', ')}`);
    return;
  }

  const card = await cardsDb.findById(req.params.id, req.params.userId);
  if (!card) {
    res.status(404).json({ message: 'Card not found', status: 404 });
    return;
  }

  const { newLevel, nextReview } = computeReview(card.level, performance as ReviewPerformance);
  const updated = await cardsDb.updateReview(req.params.id, req.params.userId, newLevel, nextReview);

  res.json(updated);
});
