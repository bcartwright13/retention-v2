import { Request, Response } from 'express';
import * as cardsDb from '../db/cards';
import { computeReview } from '../services/retention';
import { ReviewPerformance } from '../types';

const VALID_PERFORMANCES: ReviewPerformance[] = ['forgot', 'struggled', 'gotit', 'mastered'];

export async function getCards(req: Request, res: Response): Promise<void> {
  const cards = await cardsDb.findAllByUserId(req.params.userId);
  res.json(cards);
}

export async function getDueCards(req: Request, res: Response): Promise<void> {
  const cards = await cardsDb.findDueByUserId(req.params.userId);
  res.json(cards);
}

export async function createCard(req: Request, res: Response): Promise<void> {
  const { title, content, category } = req.body;

  if (!title || !content) {
    res.status(400).json({ message: 'Title and content are required', status: 400 });
    return;
  }

  const card = await cardsDb.create(req.params.userId, { title, content, category });
  res.status(201).json(card);
}

export async function updateCard(req: Request, res: Response): Promise<void> {
  const { title, category, content } = req.body;

  if (title === undefined && category === undefined && content === undefined) {
    res.status(400).json({ message: 'At least one field (title, category, content) is required', status: 400 });
    return;
  }

  const card = await cardsDb.update(req.params.id, req.params.userId, { title, category, content });
  if (!card) {
    res.status(404).json({ message: 'Card not found', status: 404 });
    return;
  }

  res.json(card);
}

export async function deleteCard(req: Request, res: Response): Promise<void> {
  const deleted = await cardsDb.remove(req.params.id, req.params.userId);
  if (!deleted) {
    res.status(404).json({ message: 'Card not found', status: 404 });
    return;
  }

  res.status(204).end();
}

export async function reviewCard(req: Request, res: Response): Promise<void> {
  const { performance } = req.body;

  if (!performance || !VALID_PERFORMANCES.includes(performance)) {
    res.status(400).json({
      message: `Invalid performance. Must be one of: ${VALID_PERFORMANCES.join(', ')}`,
      status: 400,
    });
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
}
