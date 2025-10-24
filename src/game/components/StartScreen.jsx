// File: src/game/components/StartScreen.jsx
import React, { useState } from 'react'
import { useGame } from '../contexts/GameContext'
import '../../styles/startScreen.css'

export default function StartScreen() {
    const { startGame, started } = useGame()

    const [stage, setStage] = useState('welcome')
    const [playerName, setPlayerName] = useState('')
    const [adminUser, setAdminUser] = useState('')
    const [adminPass, setAdminPass] = useState('')
    const [error, setError] = useState('')

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
                <h1 className="react-start-title">Space Invaders</h1>

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
                        <div className="button-group">
                            <button className="react-start-button" onClick={handleStartPlayer}>
                                🚀 START GAME
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
                        <div className="button-group">
                            <button className="react-start-button" onClick={handleAdminLogin}>
                                🔒 Login
                            </button>
                            <button className="react-link-button" onClick={() => setStage('selectRole')}>
                                ← Back
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
