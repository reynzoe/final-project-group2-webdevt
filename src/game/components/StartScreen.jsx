// File: src/game/components/StartScreen.jsx (Tailwind — Retro Arcade)
import React, { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import AdminDashboard from './AdminDashboard'
import Shop from './Shop'
import { audio } from '../audio'
import '../../styles/startScreen.css'

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

  const crawlTimerRef = React.useRef(null)
  const beginTimerRef = React.useRef(null)
  const shownCrawlRef = React.useRef(false)
  const guestIntentRef = React.useRef(false)

  const [stage, setStage] = useState('welcome')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [guestPlaying, setGuestPlaying] = useState(false)
  const [showShop, setShowShop] = useState(false)
  const [showCrawl, setShowCrawl] = useState(false)
  const [showBegin, setShowBegin] = useState(false)
  const [introAutoPlay, setIntroAutoPlay] = useState(() => {
    try {
      const v = localStorage.getItem('sk_autoplay_intro')
      return v === null ? true : v === 'true'
    } catch (e) {
      return true
    }
  })

  useEffect(() => {
    function handleReset() {
      setGuestPlaying(false)
    }
    window.addEventListener('gameReset', handleReset)
    return () => window.removeEventListener('gameReset', handleReset)
  }, [])

  useEffect(() => {
    return () => {
      if (crawlTimerRef.current) clearTimeout(crawlTimerRef.current)
      if (beginTimerRef.current) clearTimeout(beginTimerRef.current)
    }
  }, [])

  // Auto-play the intro the first time the StartScreen is shown on the welcome stage
  useEffect(() => {
    if (stage === 'welcome' && !shownCrawlRef.current && introAutoPlay) {
      shownCrawlRef.current = true
      setShowCrawl(true)
      // show the BEGIN text after the crawl animation finishes (match CSS animation)
      beginTimerRef.current = setTimeout(() => setShowBegin(true), 14000)
    }
    return () => {
      if (beginTimerRef.current) clearTimeout(beginTimerRef.current)
    }
  }, [stage])

  useEffect(() => {
    try {
      localStorage.setItem('sk_autoplay_intro', introAutoPlay ? 'true' : 'false')
    } catch (e) {
      // ignore
    }
  }, [introAutoPlay])

  const [showSettings, setShowSettings] = useState(false)
  const [soundVolume, setSoundVolume] = useState(() => {
    try { return parseFloat(localStorage.getItem('sk_sound_volume')) ?? 0.5 } catch (e) { return 0.5 }
  })

  useEffect(() => {
    // apply volume to all audio sources
    try {
      Object.values(audio).forEach((a) => {
        if (a && typeof a.volume === 'function') a.volume(soundVolume)
      })
    } catch (e) {}
    try { localStorage.setItem('sk_sound_volume', String(soundVolume)) } catch (e) {}
  }, [soundVolume])

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
    // clear any guest intent and show the crawl; user will click BEGIN to actually start
    guestIntentRef.current = false
    setShowCrawl(true)
    setShowBegin(false)
    if (beginTimerRef.current) clearTimeout(beginTimerRef.current)
    beginTimerRef.current = setTimeout(() => setShowBegin(true), 14000)
  }

  function handleGuestPlay() {
    // For guest play: play a short select sound, skip the intro and start the game immediately
    try { audio.select.play() } catch (e) { /* ignore */ }
    if (beginTimerRef.current) clearTimeout(beginTimerRef.current)
    if (crawlTimerRef.current) clearTimeout(crawlTimerRef.current)
    guestIntentRef.current = false
    setShowCrawl(false)
    setShowBegin(false)
    const startButton = document.querySelector('#startButton')
    if (startButton) startButton.click()
    setGuestPlaying(true)
  }

  // (Removed showIntroOnly — intro now auto-plays on first visit and can be triggered by Start/Guest)

  function skipCrawl() {
    if (crawlTimerRef.current) clearTimeout(crawlTimerRef.current)
    if (beginTimerRef.current) clearTimeout(beginTimerRef.current)
    setShowCrawl(false)
    setShowBegin(false)
    // clear any pending guest intent so skipping doesn't auto-start
    guestIntentRef.current = false
  }

  function beginGame() {
    // Called when user clicks BEGIN after the intro — start the game
    if (beginTimerRef.current) clearTimeout(beginTimerRef.current)
    if (crawlTimerRef.current) clearTimeout(crawlTimerRef.current)
    setShowCrawl(false)
    setShowBegin(false)
    // If guest was intended, mark guestPlaying so React hides the start UI.
    // The actual game loop is started by clicking the hidden '#startButton' element.
    const startButton = document.querySelector('#startButton')
    if (guestIntentRef.current) {
      if (startButton) startButton.click()
      setGuestPlaying(true)
      guestIntentRef.current = false
      return
    }

    // logged-in user flow: only start if there's a logged in user
    if (user) {
      if (typeof startGame === 'function') startGame()
      if (startButton) startButton.click()
      return
    }

    // Not logged in and not playing as guest: close intro and open login/register
    setShowCrawl(false)
    setShowBegin(false)
    setStage('login')
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

  // THIS IS THE MAIN BACKGROUND START SCREEN (themed)
  return (
    <div className="ss-wrapper fixed inset-0 z-40">
      <div className="ss-stars" aria-hidden="true" />
      <div className="ss-stars-2" aria-hidden="true" />

      <div className="ss-card">
        <div className="ss-card-inner">
        <div className="ss-header mb-4">
          <img src="/img/spaceship.png" alt="logo" className="ss-logo" />
          <h1 className="ss-title">Star Killer</h1>
        </div>

        {stage === 'welcome' && (
          <div className="flex flex-col gap-3">
            <button className="ss-btn ss-btn-primary" onClick={() => setStage('login')}>🔓 Login</button>
            <button className="ss-btn ss-btn-accent" onClick={() => setStage('register')}>✨ Register</button>
            <button className="ss-btn ss-btn-guest" onClick={handleGuestPlay}>🎮 Play as Guest</button>
            <div className="flex gap-2 justify-center">
              <button className="ss-btn ss-btn-ghost" onClick={() => setShowLeaderboard(true)}>🏆 View Leaderboard</button>
              <button className="ss-btn ss-btn-ghost" onClick={() => setShowSettings(true)}>⚙️ Settings</button>
            </div>
          </div>
        )}

        {stage === 'register' && (
          <div className="ss-form">
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

            <div className="ss-actions">
              <button className="ss-btn ss-btn-primary" onClick={handleRegister}>✅ Register</button>
              <button className="ss-btn ss-btn-ghost" onClick={() => setStage('welcome')}>← Back</button>
            </div>
          </div>
        )}

        {stage === 'login' && (
          <div className="ss-form">
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

            <div className="ss-actions">
              <button className="ss-btn ss-btn-primary" onClick={handleLogin}>🔒 Login</button>
              <button className="ss-btn ss-btn-ghost" onClick={() => setStage('welcome')}>← Back</button>
            </div>
          </div>
        )}
      </div>
      </div>
      
  {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      {showCrawl && (
        <div className="ss-crawl-overlay" onClick={skipCrawl} role="dialog" aria-modal="true">
          {/* background galaxies/stars for the intro */}
          <div className="ss-crawl-bg" aria-hidden="true">
            <div className="ss-galaxy ss-galaxy-1" />
            <div className="ss-galaxy ss-galaxy-2" />
            <div className="ss-crawl-stars" />
          </div>

          <div className="ss-crawl-wrap" onClick={(e) => e.stopPropagation()}>
            <div className="ss-crawl"><span className="crawl-title">STAR KILLER</span>
              <p>
                It is a period of interstellar conflict. Rebel pilots strike from hidden bases against the
                marauding invaders. A brave young pilot—driven by courage and coin—seeks glory across the
                starfields.
              </p>
              <p>
                Armed with only a battered starfighter and a handful of power-ups, the pilot must blast through
                wave after wave of invaders, collect coins, and survive long enough to topple the cosmic menace.
              </p>
              <p>May your reflexes be sharp and your lasers truer than the night.</p>
            </div>

            {showBegin && (
              <div className="ss-begin" onClick={beginGame} role="button" tabIndex={0}>
                BEGIN
              </div>
            )}
          </div>

          <button className="close-crawl" onClick={(e) => { e.stopPropagation(); skipCrawl(); }}>Skip</button>
        </div>
      )}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center z-50" onClick={() => setShowSettings(false)}>
          <div className="w-[420px] bg-[#07070a] text-white p-5 rounded-xl border border-blue-900/40 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">Settings</h2>
              <button className="ss-btn ss-btn-ghost" onClick={() => setShowSettings(false)}>Close</button>
            </div>

            <div className="mt-3">
              <label className="block text-sm text-slate-300 mb-1">Auto Intro</label>
              <div className="flex items-center gap-3 mb-3">
                <button className={`ss-btn ss-btn-ghost ${introAutoPlay ? 'active' : ''}`} onClick={() => setIntroAutoPlay(true)}>On</button>
                <button className={`ss-btn ss-btn-ghost ${!introAutoPlay ? 'active' : ''}`} onClick={() => setIntroAutoPlay(false)}>Off</button>
              </div>

              <label className="block text-sm text-slate-300 mb-1">Sound Volume</label>
              <input type="range" min="0" max="1" step="0.01" value={soundVolume} onChange={(e) => setSoundVolume(parseFloat(e.target.value))} className="w-full" />

              <div className="mt-4 text-sm text-slate-300">Tip: You can toggle Auto Intro here. Volume is saved per browser.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
