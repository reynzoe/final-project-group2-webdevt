// File: src/game/components/StartScreen.jsx
import React, { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import '../../styles/startScreen.css'

function LeaderboardModal({ onClose }) {
    const [rows, setRows] = useState([])
    const [status, setStatus] = useState('loading') // loading | ready | error

    useEffect(() => {
        const ac = new AbortController()
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        setStatus('loading')
        fetch(`${API_BASE}/api/leaderboard`, { signal: ac.signal })
            .then(async (res) => {
                if (!res.ok) throw new Error('bad')
                const data = await res.json()
                const list = Array.isArray(data) ? data : Array.isArray(data?.leaderboard) ? data.leaderboard : []
                setRows(list)
                setStatus('ready')
            })
            .catch(() => setStatus('error'))
        return () => ac.abort()
    }, [])

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
    )
}

export default function StartScreen() {
    const { startGame, started } = useGame()

    const [stage, setStage] = useState('welcome')
    const [playerName, setPlayerName] = useState('')
    const [adminUser, setAdminUser] = useState('')
    const [adminPass, setAdminPass] = useState('')
    const [error, setError] = useState('')
    const [showLeaderboard, setShowLeaderboard] = useState(false)

    const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123' }

    function proceedToRole(r) {
        setError('')
        setStage(r === 'player' ? 'player' : 'admin')
    }

    function handleStartPlayer() {
        if (!playerName.trim()) {
            setError('⚠️ You need to enter a name before starting!')
            return
        }
        setError('')
        startGame({ name: playerName.trim(), role: 'player' })

        const startButton = document.querySelector('#startButton')
        if (startButton) startButton.click()
    }

    function handleAdminLogin() {
        if (!adminUser.trim() || !adminPass) {
            setError('Enter username and password')
            return
        }
        if (adminUser !== ADMIN_CREDENTIALS.username || adminPass !== ADMIN_CREDENTIALS.password) {
            setError('Invalid admin credentials')
            return
        }
        setError('')
        startGame({ name: adminUser.trim(), role: 'admin' })

        const startButton = document.querySelector('#startButton')
        if (startButton) startButton.click()
    }

    // Hide the component when game has started
    if (started) {
        return null
    }

    return (
        <div className="react-start-screen">
            <div className="react-start-card">
                <h1 className="react-start-title">Lowell Invasion</h1>

                {stage === 'welcome' && (
                    <button className="react-start-button" onClick={() => setStage('selectRole')}>
                        ▶ Start
                    </button>
                )}

                {stage === 'selectRole' && (
                    <div className="role-select">
                        <button className="react-start-button" onClick={() => proceedToRole('player')}>
                            🎮 Play as Player
                        </button>
                        <button className="react-start-button admin-btn" onClick={() => proceedToRole('admin')}>
                            🔐 Admin Login
                        </button>
                        <button className="react-link-button" onClick={() => setShowLeaderboard(true)}>
                            🏆 View Leaderboard
                        </button>
                    </div>
                )}

                {stage === 'player' && (
                    <>
                        <label className="react-start-label">Enter your player name:</label>
                        <input
                            className="react-start-input"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStartPlayer()}
                            placeholder="Ex: Player1"
                            maxLength={20}
                            autoFocus
                        />
                        {error && <div className="react-error">{error}</div>}
                        <div className="button-group" style={{ gap: 8, display: 'flex', flexWrap: 'wrap' }}>
                            <button className="react-start-button" onClick={handleStartPlayer}>
                                🚀 START GAME
                            </button>
                            <button className="react-link-button" onClick={() => setShowLeaderboard(true)}>
                                🏆 View Leaderboard
                            </button>
                            <button className="react-link-button" onClick={() => setStage('selectRole')}>
                                ← Back
                            </button>
                        </div>
                    </>
                )}

                {stage === 'admin' && (
                    <>
                        <label className="react-start-label">Admin Username:</label>
                        <input
                            className="react-start-input"
                            value={adminUser}
                            onChange={(e) => setAdminUser(e.target.value)}
                            placeholder="admin"
                            onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                            autoFocus
                        />
                        <label className="react-start-label">Password:</label>
                        <input
                            className="react-start-input"
                            type="password"
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                            placeholder="••••••••"
                        />
                        {error && <div className="react-error">{error}</div>}
                        <div className="button-group" style={{ gap: 8, display: 'flex', flexWrap: 'wrap' }}>
                            <button className="react-start-button" onClick={handleAdminLogin}>
                                🔒 Login
                            </button>
                            <button className="react-link-button" onClick={() => setShowLeaderboard(true)}>
                                🏆 View Leaderboard
                            </button>
                            <button className="react-link-button" onClick={() => setStage('selectRole')}>
                                ← Back
                            </button>
                        </div>
                    </>
                )}
            </div>

            {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
        </div>
    )
}
