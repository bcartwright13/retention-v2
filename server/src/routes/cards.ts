import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorizeUser } from '../middleware/authorizeUser';
import {
  getCards,
  getDueCards,
  createCard,
  updateCard,
  deleteCard,
  reviewCard,
} from '../controllers/cards.controller';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(authorizeUser);

router.get('/', getCards);
router.get('/due', getDueCards);
router.post('/', createCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);
router.patch('/:id/review', reviewCard);

export default router;
