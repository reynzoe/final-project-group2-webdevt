import { Router } from 'express';
import { User, Score } from '../models/index.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

// Get all users (admin only)
router.get('/admin/users', authenticate, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error('Failed to fetch users:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get all scores (admin only)
router.get('/admin/scores', authenticate, isAdmin, async (req, res) => {
    try {
        const scores = await Score.find().sort({ score: -1, createdAt: 1 });
        res.json(scores);
    } catch (err) {
        console.error('Failed to fetch scores:', err);
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});

// Delete user (admin only)
router.delete('/admin/users/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Also delete their scores
        await Score.deleteMany({ username: user.username });

        res.json({ message: 'User and their scores deleted', username: user.username });
    } catch (err) {
        console.error('Failed to delete user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Delete score (admin only)
router.delete('/admin/scores/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const score = await Score.findByIdAndDelete(req.params.id);
        if (!score) return res.status(404).json({ error: 'Score not found' });
        res.json({ message: 'Score deleted', score });
    } catch (err) {
        console.error('Failed to delete score:', err);
        res.status(500).json({ error: 'Failed to delete score' });
    }
});

// Ban user (set role to 'banned')
router.put('/admin/users/:id/ban', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: 'banned' },
            { new: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User banned', user });
    } catch (err) {
        console.error('Failed to ban user:', err);
        res.status(500).json({ error: 'Failed to ban user' });
    }
});

export default router;
