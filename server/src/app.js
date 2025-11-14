// javascript
import express from 'express';
import cors from 'cors';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import shopRoutes from './routes/shop.routes.js';

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'https://final-project-group2-webdevt.vercel.app',
        'https://final-project-group2-webdevt-production.up.railway.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ ok: true });
});

// Routes under /api
app.use('/api', authRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api', adminRoutes);
app.use('/api', shopRoutes);

// 404 and error handlers
app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
});

export default app;
