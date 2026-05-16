import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorizeUser } from '../middleware/authorizeUser';
import { uuidParam } from '../middleware/uuidParam';
import {
  getCards,
  getDueCards,
  createCard,
  updateCard,
  deleteCard,
  reviewCard,
} from '../controllers/cards.controller';

const router = Router({ mergeParams: true });

// H5: Validate UUID-shaped params before anything else runs so we never
// hand garbage to Postgres (which would surface as a 500 from invalid
// uuid syntax) and so attackers can't fingerprint via error differences.
router.param('userId', uuidParam);
router.param('id', uuidParam);

router.use(authenticate);
router.use(authorizeUser);

router.get('/', getCards);
router.get('/due', getDueCards);
router.post('/', createCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);
router.patch('/:id/review', reviewCard);

export default router;
