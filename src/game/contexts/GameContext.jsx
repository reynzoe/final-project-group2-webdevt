import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export function GameProvider({ children }) {
    const [user, setUser] = useState(null); // { id, username, email, role, coins }
    const [token, setToken] = useState(null);
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(true);

    // Auto-login on mount if token exists in localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('spaceInvadersToken');
        if (savedToken) {
            verifyToken(savedToken);
        } else {
            setLoading(false);
        }
    }, []);

    async function verifyToken(savedToken) {
        try {
            const res = await fetch(`${API_BASE}/api/auth/verify`, {
                headers: { Authorization: `Bearer ${savedToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setToken(savedToken);
            } else {
                localStorage.removeItem('spaceInvadersToken');
            }
        } catch (err) {
            console.error('Token verification failed:', err);
            localStorage.removeItem('spaceInvadersToken');
        } finally {
            setLoading(false);
        }
    }

    async function register({ username, email, password }) {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('spaceInvadersToken', data.token);
        return data;
    }

    async function login({ username, password }) {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('spaceInvadersToken', data.token);
        return data;
    }

    function logout() {
        setUser(null);
        setToken(null);
        setStarted(false);
        localStorage.removeItem('spaceInvadersToken');
    }

    function startGame() {
        if (!user) {
            console.error('Cannot start game without being logged in');
            return;
        }
        setStarted(true);
        console.log('Game started for', user.username, 'role:', user.role);
    }

    function resetGame() {
        setStarted(false);
    }

    const value = {
        user,
        token,
        started,
        loading,
        register,
        login,
        logout,
        startGame,
        resetGame
    };

    useEffect(() => {
        window.__gameContext = value;
    }, [value]);

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGame must be used inside GameProvider');
    return ctx;
}
