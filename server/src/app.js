// server/src/app.js
import express from 'express';
import cors from 'cors';
import leaderboardRoutes from './routes/leaderboard.routes.js';

const app = express();

// Fix CORS to allow requests from Vite dev server
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ ok: true });
});

app.use(leaderboardRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
});

export default app;
