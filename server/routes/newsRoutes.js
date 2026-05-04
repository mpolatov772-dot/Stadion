import { Router } from 'express';

import { getFootballMatches, getLeagueStandings, getNews } from '../controllers/newsController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/matches', asyncHandler(getFootballMatches));
router.get('/standings', asyncHandler(getLeagueStandings));
router.get('/', asyncHandler(getNews));

export default router;
