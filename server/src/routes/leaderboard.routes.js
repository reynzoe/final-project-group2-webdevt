import { Router } from 'express';
import { Score, User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/scores
 * Submits a player's score and updates their coins.
 */
router.post('/scores', authenticate, async (req, res) => {
    try {
        const { score } = req.body ?? {};
        const username = req.user.username;

        // Validate score
        const parsedScore = Number(score);
        if (!Number.isFinite(parsedScore) || parsedScore < 0) {
            return res.status(400).json({ error: 'Invalid score. Must be a non-negative number.' });
        }

        const coins = Math.floor(parsedScore / 10);

        // Save score
        const doc = await Score.create({
            username,
            score: parsedScore,
            coins
        });

        // Update user's coins
        await User.findByIdAndUpdate(
            req.user.userId,
            { $inc: { coins: coins } },
            { new: true }
        );

        return res.status(201).json(doc);
    } catch (err) {
        console.error('POST /api/scores failed:', err);
        return res.status(500).json({ error: 'Failed to submit score.' });
    }
});

/**
 * GET /api/leaderboard
 * Returns the top 10 scores sorted by highest score.
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
