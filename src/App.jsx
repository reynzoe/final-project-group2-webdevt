// File: src/App.jsx
import React, { useEffect, useRef } from 'react'
import './index.css'
import { GameProvider } from './game/contexts/GameContext'
import StartScreen from './game/components/StartScreen'

function AppContent() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = 1024
        canvas.height = 576

        import('./game/index.js').catch((e) => {
            console.error('Failed to load game module:', e)
        })
    }, [])

    return (
        <div id="parentDiv" style={{ position: 'relative' }}>
            <p
                id="scoreContainer"
                style={{
                    position: 'absolute',
                    zIndex: 10,
                    color: 'white',
                    left: 10,
                    top: 10,
                    margin: 0,
                    display: 'none'
                }}
            >
                <span>Score:</span> <span id="scoreEl">0</span>
            </p>

            <canvas ref={canvasRef} />

            {/* Original DOM start screen (hidden, but game code needs it) */}
            <div id="startScreen" style={{ display: 'none' }}>
                <div id="startButton"></div>
            </div>

            {/* React start screen overlay */}
            <StartScreen />

            {/* Restart screen */}
            <div
                id="restartScreen"
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    background: 'url(/img/startScreenBackground.png)',
                    zIndex: 20,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ color: 'white', fontSize: 24 }}>Game Over</h1>
                    <h1 id="finalScore" style={{ color: 'white', margin: 0, fontSize: 48 }}>0</h1>
                    <p style={{ color: 'white', marginTop: 0 }}>Points</p>
                    <div
                        id="restartButton"
                        style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                    >
                        <img src="/img/button.png" alt="Restart Button" />
                        <span
                            style={{
                                position: 'absolute',
                                color: 'white',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
              Restart
            </span>
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
