import { Router } from 'express';
import { Score } from '../models/index.js';

const router = Router();

/**
 * POST /api/scores
 * Submits a player's score.
 * - Validates input.
 * - Calculates coins = floor(score / 10).
 * - Saves and returns the created score document.
 */
router.post('/scores', async (req, res) => {
    try {
        const { username, score } = req.body ?? {};

        // Basic validation
        if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 32) {
            return res.status(400).json({ error: 'Invalid username. Must be a string between 3 and 32 characters.' });
        }
        const parsedScore = Number(score);
        if (!Number.isFinite(parsedScore) || parsedScore < 0) {
            return res.status(400).json({ error: 'Invalid score. Must be a non-negative number.' });
        }

        const coins = Math.floor(parsedScore / 10);

        const doc = await Score.create({
            username: username.trim(),
            score: parsedScore,
            coins
        });

        return res.status(201).json(doc);
    } catch (err) {
        console.error('POST /api/scores failed:', err);
        return res.status(500).json({ error: 'Failed to submit score.' });
    }
});

/**
 * GET /api/leaderboard
 * Returns the top 10 scores sorted by highest score (then earliest createdAt for ties).
 */
router.get('/leaderboard', async (_req, res) => {
    try {
        const top = await Score.find({})
            .sort({ score: -1, createdAt: 1 })
            .limit(10)
            .lean()
            .exec();

        return res.json(top);
    } catch (err) {
        console.error('GET /api/leaderboard failed:', err);
        return res.status(500).json({ error: 'Failed to fetch leaderboard.' });
    }
});

export default router;
