// File: src/App.jsx (Retro Arcade Tailwind Version)
import React, { useEffect, useRef } from 'react'
import './index.css'
import { GameProvider } from './game/contexts/GameContext'
import StartScreen from './game/components/StartScreen'

function AppContent() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    import('./game/index.js').catch((e) => {
      console.error('Failed to load game module:', e)
    })
  }, [])

  useEffect(() => {
    const handleResize = () => {
        const canvas = canvasRef.current
        if (canvas) {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
<div id="parentDiv" className="relative w-full h-full font-arcade select-none overflow-hidden">
      {/* HUD / Score */}
      <div id="scoreContainer" className="absolute z-20 left-3 top-3 m-0 hidden">
        <div className="hud bg-transparent p-2 rounded-md">
          <div className="hud-row flex items-center gap-3">
            <div className="hud-item text-white text-sm">Player: <span id="hudUsername" className="font-bold">guest</span></div>
            <div className="hud-item text-white text-sm">Coins: <span id="hudCoins" className="font-bold">0</span></div>
            <div className="hud-item text-white text-sm">Score: <span id="scoreEl" className="font-bold">0</span></div>
          </div>
          <div className="hud-row mt-2 flex items-center gap-3">
            <div className="hud-item text-white text-sm">Role: <span id="hudRole" className="font-bold">player</span></div>
            <div className="hud-item text-white text-sm">Skin:
              <img id="hudSkinImg" src="/img/spaceship.png" alt="skin" className="ml-2 w-8 h-6 object-contain rounded-sm border" />
              <span id="hudSkin" className="ml-2 font-bold">default</span>
            </div>
            <div className="hud-item text-white text-sm flex items-center gap-2">Projectile:
              <div id="hudProjectileSwatch" className="w-6 h-4 rounded-sm border" style={{background:'lightblue'}} />
            </div>
            <div className="hud-item text-white text-sm">Lives: <span id="hudLives" className="font-bold">-</span></div>
          </div>
        </div>
      </div>

    

      {/* Canvas */}
      <canvas ref={canvasRef} className="" />

      {/* Required hidden original DOM elements */}
      <div id="startScreen" className="hidden">
        <div id="startButton"></div>
      </div>

      {/* React Start Screen */}
      <StartScreen />

      {/* Restart Screen (styled like Start Screen) */}
      <div id="restartScreen" className="hidden absolute inset-0 z-30 flex items-center justify-center">
        <div className="ss-stars" aria-hidden="true" />
        <div className="ss-stars-2" aria-hidden="true" />

        <div className="ss-card ss-card--gameover p-6 text-center">
          <div className="ss-header mb-4">
            <img src="/img/spaceship.png" alt="logo" className="ss-logo" />
            <h1 className="ss-title ss-title--danger">Game Over</h1>
          </div>

          <h1 id="finalScore" className="text-6xl mt-2 text-white drop-shadow-[0_0_10px_#ff0]">0</h1>
          <p className="text-white text-lg -mt-2">Points</p>

          <p id="coinsEarned" className="text-yellow-400 text-xl font-bold my-2 hidden drop-shadow-[0_0_6px_#ff0]">
            +0 coins earned!
          </p>

          <div className="flex gap-4 justify-center mt-4">
            {/* Restart Button (themed) */}
            <button id="restartButton" className="ss-btn ss-btn-primary">Restart</button>

            {/* Leaderboard */}
            <button id="viewLeaderboardButton" className="ss-btn ss-btn-ghost">
              View Leaderboard
            </button>

            {/* Main Menu */}
            <button id="mainMenuButton" className="ss-btn ss-btn-ghost">
              Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}
