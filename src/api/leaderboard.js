// src/api/leaderboard.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export async function fetchLeaderboard(signal) {
    const res = await fetch(`${API_BASE}/api/leaderboard`, { signal });
    if (!res.ok) throw new Error('Failed to load leaderboard');
    return res.json();
}

export async function submitScore({ username, score }) {
    const res = await fetch(`${API_BASE}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, score })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to submit score');
    return data;
}
