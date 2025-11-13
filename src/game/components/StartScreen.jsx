import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import '../../styles/startScreen.css';
import AdminDashboard from './AdminDashboard';


function LeaderboardModal({ onClose }) {
    const [rows, setRows] = useState([]);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const ac = new AbortController();
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050';
        setStatus('loading');
        fetch(`${API_BASE}/api/leaderboard`, { signal: ac.signal })
            .then(async (res) => {
                if (!res.ok) throw new Error('bad');
                const data = await res.json();
                const list = Array.isArray(data) ? data : Array.isArray(data?.leaderboard) ? data.leaderboard : [];
                setRows(list);
                setStatus('ready');
            })
            .catch(() => setStatus('error'));
        return () => ac.abort();
    }, []);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'grid',
                placeItems: 'center',
                zIndex: 9999
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ background: '#111', color: '#fff', padding: 16, width: 420, borderRadius: 8 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Leaderboard</h2>
                    <button onClick={onClose} className="react-start-button">Close</button>
                </div>
                <div style={{ marginTop: 12 }}>
                    {status === 'loading' && <p>Loading leaderboard...</p>}
                    {status === 'error' && <p>Failed to load leaderboard.</p>}
                    {status === 'ready' && rows.length === 0 && <p>No scores yet.</p>}
                    {status === 'ready' && rows.length > 0 && (
                        <ol style={{ paddingLeft: 18 }}>
                            {rows.map((r, i) => (
                                <li key={r._id ?? i} style={{ marginBottom: 6 }}>
                                    <strong>{r.username ?? 'anonymous'}</strong> — {r.score} pts
                                    {typeof r.coins === 'number' ? `, ${r.coins} coins` : ''}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function StartScreen() {
    const { user, started, loading, register, login, logout, startGame } = useGame();

    const [stage, setStage] = useState('welcome');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [guestPlaying, setGuestPlaying] = useState(false);

    // Listen for game reset event
    useEffect(() => {
        function handleReset() {
            setGuestPlaying(false);
        }
        window.addEventListener('gameReset', handleReset);
        return () => window.removeEventListener('gameReset', handleReset);
    }, []);

    async function handleRegister() {
        try {
            setError('');
            await register({ username, email, password });
            setStage('loggedIn');
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleLogin() {
        try {
            setError('');
            await login({ username, password });
            setStage('loggedIn');
        } catch (err) {
            setError(err.message);
        }
    }

    function handleStartGame() {
        startGame();
        const startButton = document.querySelector('#startButton');
        if (startButton) startButton.click();
    }

    function handleGuestPlay() {
        setGuestPlaying(true);
        startGame();
        const startButton = document.querySelector('#startButton');
        if (startButton) startButton.click();
    }

    function handleLogout() {
        logout();
        setStage('welcome');
        setUsername('');
        setEmail('');
        setPassword('');
        setError('');
    }

    // Show loading spinner while checking localStorage
    if (loading) {
        return (
            <div className="react-start-screen">
                <div className="react-start-card">
                    <h1 className="react-start-title">Loading...</h1>
                </div>
            </div>
        );
    }

    // Hide screen when game starts (for both logged-in users and guests)
    if (started || guestPlaying) {
        return null;
    }

    // If user is logged in, show logged-in screen
    if (user) {
        return (
            <>
                <div className="react-start-screen">
                    <div className="react-start-card">
                        <h1 className="react-start-title">Welcome, {user.username}!</h1>
                        <p style={{ color: '#fff', marginBottom: 16 }}>
                            Coins: {user.coins} | Role: {user.role}
                        </p>
                        <button className="react-start-button" onClick={handleStartGame}>
                            🚀 START GAME
                        </button>
                        <button className="react-link-button" onClick={() => setShowLeaderboard(true)}>
                            🏆 View Leaderboard
                        </button>
                        <button className="react-link-button" onClick={handleLogout}>
                            🚪 Logout
                        </button>
                    </div>
                    {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
                </div>
                {user.role === 'admin' && <AdminDashboard />}
            </>
        );
    }


    return (
        <div className="react-start-screen">
            <div className="react-start-card">
                <h1 className="react-start-title">Star Killer</h1>

                {stage === 'welcome' && (
                    <>
                        <button className="react-start-button" onClick={() => setStage('login')}>
                            🔓 Login
                        </button>
                        <button className="react-start-button" onClick={() => setStage('register')}>
                            ✨ Register
                        </button>
                        <button className="react-start-button" onClick={handleGuestPlay}>
                            🎮 Play as Guest
                        </button>
                        <button className="react-link-button" onClick={() => setShowLeaderboard(true)}>
                            🏆 View Leaderboard
                        </button>
                    </>
                )}

                {stage === 'register' && (
                    <>
                        <label className="react-start-label">Username:</label>
                        <input
                            className="react-start-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="player123"
                            maxLength={32}
                            autoFocus
                        />
                        <label className="react-start-label">Email:</label>
                        <input
                            className="react-start-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                        <label className="react-start-label">Password:</label>
                        <input
                            className="react-start-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                        />
                        {error && <div className="react-error">{error}</div>}
                        <div className="button-group" style={{ gap: 8, display: 'flex', flexWrap: 'wrap' }}>
                            <button className="react-start-button" onClick={handleRegister}>
                                ✅ Register
                            </button>
                            <button className="react-link-button" onClick={() => setStage('welcome')}>
                                ← Back
                            </button>
                        </div>
                    </>
                )}

                {stage === 'login' && (
                    <>
                        <label className="react-start-label">Username:</label>
                        <input
                            className="react-start-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="player123"
                            autoFocus
                        />
                        <label className="react-start-label">Password:</label>
                        <input
                            className="react-start-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                        {error && <div className="react-error">{error}</div>}
                        <div className="button-group" style={{ gap: 8, display: 'flex', flexWrap: 'wrap' }}>
                            <button className="react-start-button" onClick={handleLogin}>
                                🔒 Login
                            </button>
                            <button className="react-link-button" onClick={() => setStage('welcome')}>
                                ← Back
                            </button>
                        </div>
                    </>
                )}
            </div>

            {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
        </div>
    );
}