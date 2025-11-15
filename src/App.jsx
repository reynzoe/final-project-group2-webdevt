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
      {/* Score */}
      <p
        id="scoreContainer"
        className="absolute z-20 text-white left-3 top-3 m-0 hidden text-xl drop-shadow-[0_0_6px_#00f]"
      >
        <span>Score:</span> <span id="scoreEl">0</span>
      </p>

    

      {/* Canvas */}
      <canvas ref={canvasRef} className="" />

      {/* Required hidden original DOM elements */}
      <div id="startScreen" className="hidden">
        <div id="startButton"></div>
      </div>

      {/* React Start Screen */}
      <StartScreen />

      {/* Restart Screen */}
      <div
        id="restartScreen"
        className="hidden absolute inset-0 z-30 bg-[url('/img/startScreenBackground.png')] bg-no-repeat bg-contain flex items-center justify-center"
      >
        <div className="text-center">
          <h1 className="text-white text-3xl drop-shadow-[0_0_8px_#f00]">Game Over</h1>
          <h1 id="finalScore" className="text-white text-6xl mt-2 drop-shadow-[0_0_10px_#ff0]">0</h1>
          <p className="text-white text-lg -mt-2">Points</p>

          <p
            id="coinsEarned"
            className="text-yellow-400 text-xl font-bold my-2 hidden drop-shadow-[0_0_6px_#ff0]"
          >
            +0 coins earned!
          </p>

          <div className="flex gap-4 justify-center mt-4">
            {/* Restart Button */}
            <div
              id="restartButton"
              className="relative cursor-pointer inline-block hover:scale-105 transition-transform"
            >
              <img src="/img/button.png" alt="Restart Button" />
              <span className="absolute text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_5px_#000]">
                Restart
              </span>
            </div>

            {/* Leaderboard */}
            <button
              id="viewLeaderboardButton"
              className="px-3 py-2 bg-black/70 text-white border border-blue-500 rounded-lg cursor-pointer
                         hover:bg-blue-700/40 hover:scale-105 transition-all"
            >
              View Leaderboard
            </button>

            {/* Main Menu */}
            <button
              id="mainMenuButton"
              className="px-3 py-2 bg-black/70 text-white border border-pink-500 rounded-lg cursor-pointer
                         hover:bg-pink-700/40 hover:scale-105 transition-all"
            >
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
