// File: src/game/components/StartScreen.jsx (Tailwind — Retro Arcade)
import React, { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import AdminDashboard from './AdminDashboard'
import Shop from './Shop'

function LeaderboardModal({ onClose }) {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const ac = new AbortController()
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050'
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
      className="fixed inset-0 bg-black/60 grid place-items-center z-50"
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[420px] bg-[#0b0b0f] text-white p-5 rounded-xl border border-blue-900/40 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-2xl font-bold tracking-wide">Leaderboard</h2>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-gradient-to-r from-slate-800 to-slate-700 text-sm text-white hover:scale-105 transition-transform"
          >
            Close
          </button>
        </div>

        <div className="mt-3">
          {status === 'loading' && <p className="text-slate-300">Loading leaderboard...</p>}
          {status === 'error' && <p className="text-red-400">Failed to load leaderboard.</p>}
          {status === 'ready' && rows.length === 0 && <p className="text-slate-300">No scores yet.</p>}

          {status === 'ready' && rows.length > 0 && (
            <ol className="list-decimal ml-5 mt-2">
              {rows.map((r, i) => (
                <li key={r._id ?? i} className="mb-2">
                  <span className="font-semibold">{r.username ?? 'anonymous'}</span>
                  <span className="text-slate-300"> — {r.score} pts</span>
                  {typeof r.coins === 'number' && (
                    <span className="text-yellow-400">, {r.coins} coins</span>
                  )}
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
  const { user, started, loading, register, login, logout, startGame } = useGame()

  const [stage, setStage] = useState('welcome')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [guestPlaying, setGuestPlaying] = useState(false)
  const [showShop, setShowShop] = useState(false)

  useEffect(() => {
    function handleReset() {
      setGuestPlaying(false)
    }
    window.addEventListener('gameReset', handleReset)
    return () => window.removeEventListener('gameReset', handleReset)
  }, [])

  useEffect(() => {
    if (stage === 'login' || stage === 'register' || stage === 'welcome') {
      setUsername('')
      setEmail('')
      setPassword('')
      setError('')
    }
  }, [stage])

  async function handleRegister() {
    try {
      setError('')
      await register({ username, email, password })
      setStage('loggedIn')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleLogin() {
    try {
      setError('')
      await login({ username, password })
      setStage('loggedIn')
    } catch (err) {
      setError(err.message)
    }
  }

  function handleStartGame() {
    startGame()
    const startButton = document.querySelector('#startButton')
    if (startButton) startButton.click()
  }

  function handleGuestPlay() {
    setGuestPlaying(true)
    startGame()
    const startButton = document.querySelector('#startButton')
    if (startButton) startButton.click()
  }

  function handleLogout() {
    logout()
    setStage('welcome')
    setUsername('')
    setEmail('')
    setPassword('')
    setError('')
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-6 z-40">
        <div className="w-full max-w-md bg-[#07070a]/90 border border-blue-900/30 rounded-2xl p-6 shadow-xl">
          <h1 className="text-3xl text-white font-bold tracking-wide">Loading...</h1>
        </div>
      </div>
    )
  }

  if (started || guestPlaying) return null

  if (user) {
    return (
      <>
        {user.role === 'admin' ? (
          <>
            <div className="fixed inset-0 flex items-center justify-center p-6 z-40">
              <div className="w-full max-w-3xl bg-[#07070a]/95 border border-blue-900/30 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl text-white font-bold tracking-wide">Admin Panel</h1>
                  <button
                    className="px-4 py-2 rounded-md bg-linear-to-r from-red-700 to-pink-600 text-white hover:scale-105 transition-transform"
                    onClick={handleLogout}
                  >
                    🚪 Logout
                  </button>
                </div>
                <AdminDashboard />
              </div>
            </div>
            {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
          </>
        ) : (
          <>
            <div className="fixed inset-0 flex items-center justify-center  p-6 z-40">
              <div className="w-full max-w-md bg-[#07070a]/95 border border-blue-900/30 rounded-2xl p-6 shadow-xl text-center">
                <h1 className="text-4xl text-white font-extrabold tracking-wide mb-3">Welcome, {user.username}!</h1>
                <p className="text-slate-300 mb-4">Coins: <span className="text-yellow-400">{user.coins}</span> | Role: {user.role}</p>

                <div className="flex flex-col gap-3">
                  <button className="py-2 rounded-md bg-linear-to-r from-indigo-700 to-cyan-500 text-white font-bold hover:scale-105 transition-transform" onClick={handleStartGame}>
                    🚀 START GAME
                  </button>

                  <button className="py-2 rounded-md bg-transparent border border-blue-700 text-blue-200 hover:bg-blue-800/30 transition" onClick={() => setShowLeaderboard(true)}>
                    🏆 View Leaderboard
                  </button>

                  <button className="py-2 rounded-md bg-transparent border border-blue-700 text-blue-200 hover:bg-blue-800/30 transition" onClick={() => setShowShop(true)}>
                    🛒 Shop
                  </button>

                  <button className="py-2 rounded-md bg-transparent border border-red-700 text-red-200 hover:bg-red-800/30 transition" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>

            {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
            {showShop && <Shop onClose={() => setShowShop(false)} />}
          </>
        )}
      </>
    )
  }

  // THIS IS THE MAIN BACKGROUND START SCREEN
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black  p-6 z-40">
      <div className="w-full max-w-md bg-[#07070a]/95 border border-blue-900/30 rounded-2xl p-6 shadow-xl text-center">
        <h1 className="text-5xl text-white font-extrabold tracking-widest mb-6">Star Killer</h1>

        {stage === 'welcome' && (
          <div className="flex flex-col gap-3">
            <button className="py-3 rounded-md bg-linear-to-r from-indigo-700 to-cyan-500 text-white font-bold hover:scale-105 transition-transform" onClick={() => setStage('login')}>
              🔓 Login
            </button>

            <button className="py-3 rounded-md bg-linear-to-r from-yellow-600 to-amber-400 text-black font-bold hover:scale-105 transition-transform" onClick={() => setStage('register')}>
              ✨ Register
            </button>

            <button className="py-3 rounded-md bg-linear-to-r from-violet-700 to-pink-600 text-white font-bold hover:scale-105 transition-transform" onClick={handleGuestPlay}>
              🎮 Play as Guest
            </button>

            <button className="py-2 rounded-md bg-transparent border border-blue-700 text-blue-200 hover:bg-blue-800/30 transition" onClick={() => setShowLeaderboard(true)}>
              🏆 View Leaderboard
            </button>
          </div>
        )}

        {stage === 'register' && (
          <div className="mt-4 text-left">
            <label className="block text-sm text-slate-300 mb-1">Username:</label>
            <input
              className="w-full bg-[#0b0b0f] border border-blue-800 rounded-md px-3 py-2 text-white placeholder:text-slate-400 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="player123"
              maxLength={32}
              autoFocus
              autoComplete="username"
            />

            <label className="block text-sm text-slate-300 mb-1">Email:</label>
            <input
              className="w-full bg-[#0b0b0f] border border-blue-800 rounded-md px-3 py-2 text-white placeholder:text-slate-400 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <label className="block text-sm text-slate-300 mb-1">Password:</label>
            <input
              className="w-full bg-[#0b0b0f] border border-blue-800 rounded-md px-3 py-2 text-white placeholder:text-slate-400 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              autoComplete="new-password"
            />

            {error && <div className="text-red-400 mb-3">{error}</div>}

            <div className="flex gap-2 flex-wrap">
              <button className="py-2 px-3 rounded-md bg-linear-to-r from-indigo-700 to-cyan-500 text-white font-bold" onClick={handleRegister}>
                ✅ Register
              </button>
              <button className="py-2 px-3 rounded-md bg-transparent border border-blue-700 text-blue-200" onClick={() => setStage('welcome')}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {stage === 'login' && (
          <div className="mt-4 text-left">
            <label className="block text-sm text-slate-300 mb-1">Username:</label>
            <input
              className="w-full bg-[#0b0b0f] border border-blue-800 rounded-md px-3 py-2 text-white placeholder:text-slate-400 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="player123"
              autoFocus
              autoComplete="username"
            />

            <label className="block text-sm text-slate-300 mb-1">Password:</label>
            <input
              className="w-full bg-[#0b0b0f] border border-blue-800 rounded-md px-3 py-2 text-white placeholder:text-slate-400 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />

            {error && <div className="text-red-400 mb-3">{error}</div>}

            <div className="flex gap-2 flex-wrap">
              <button className="py-2 px-3 rounded-md bg-linear-to-r from-indigo-700 to-cyan-500 text-white font-bold" onClick={handleLogin}>
                🔒 Login
              </button>
              <button className="py-2 px-3 rounded-md bg-transparent border border-blue-700 text-blue-200" onClick={() => setStage('welcome')}>
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>

      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
    </div>
  )
}
