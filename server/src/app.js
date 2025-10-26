import express from 'express';
import cors from 'cors';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import authRoutes from './routes/auth.routes.js'; // Add this

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'] // Add this
}));

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ ok: true });
});

app.use(authRoutes); // Add this
app.use(leaderboardRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res) => {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
});

export default app;
