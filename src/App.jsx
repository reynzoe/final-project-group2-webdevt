import React, { useEffect, useRef } from 'react'
import './index.css'

export default function App() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = 1024
        canvas.height = 576

        let mounted = true
        // Make sure this path exists: 'src/game/index.js'
        import('./game/index.js')
            .then(() => {
                /* If your game exposes an init, call it here:
                   mod.initGame?.({ canvas }) */
            })
            .catch((e) => {
                console.error('Failed to load game module:', e)
            })
        return () => {
            mounted = false
        }
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

            {/* Start screen overlay */}
            <div
                id="startScreen"
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ color: 'white' }}>Space Invaders</h1>
                    <div
                        id="startButton"
                        style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                    >
                        <img src="/img/button.png" alt="Start Button" />
                        <span
                            style={{
                                position: 'absolute',
                                color: 'white',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
              Start
            </span>
                    </div>
                </div>
            </div>

            {/* Restart screen overlay */}
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