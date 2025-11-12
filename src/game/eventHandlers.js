import { Projectile } from './entities/Projectile'
import { audio } from './audio'

export function setupKeyboardControls(gameState) {
  addEventListener('keydown', ({ key }) => {
    if (gameState.game.over) return

    switch (key) {
      case 'a':
        gameState.keys.a.pressed = true
        break
      case 'd':
        gameState.keys.d.pressed = true
        break
      case ' ':
        gameState.keys.space.pressed = true

        if (!gameState.player || gameState.player.powerUp === 'MachineGun') return

        audio.shoot.play()
        gameState.projectiles.push(
          new Projectile({
            position: {
              x: gameState.player.position.x + gameState.player.width / 2,
              y: gameState.player.position.y
            },
            velocity: {
              x: 0,
              y: -10
            }
          })
        )
        break
    }
  })

  addEventListener('keyup', ({ key }) => {
    switch (key) {
      case 'a':
        gameState.keys.a.pressed = false
        break
      case 'd':
        gameState.keys.d.pressed = false
        break
      case ' ':
        gameState.keys.space.pressed = false
        break
    }
  })
}

export function setupUIHandlers(gameState) {
    const viewBtn = document.querySelector('#viewLeaderboardButton')
    if (viewBtn) {
        viewBtn.addEventListener('click', async () => {
            audio.select.play()
            try {
                const {fetchLeaderboard} = await import('../api/leaderboard.js')
                const controller = new AbortController()
                const list = await fetchLeaderboard(controller.signal)

                const overlay = document.createElement('div')
                overlay.id = 'leaderboardOverlay'
                Object.assign(overlay.style, {
                    position: 'fixed',
                    inset: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.85)',
                    zIndex: 10000
                })

                const panel = document.createElement('div')
                Object.assign(panel.style, {
                    background: '#0b0b0b',
                    color: 'white',
                    padding: '18px',
                    borderRadius: '8px',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    width: '90%',
                    maxWidth: '600px',
                    boxSizing: 'border-box'
                })

                const title = document.createElement('h2')
                title.textContent = 'Leaderboard'
                title.style.marginTop = '0'
                panel.appendChild(title)

                if (!Array.isArray(list) || list.length === 0) {
                    const empty = document.createElement('p')
                    empty.textContent = 'No scores yet.'
                    panel.appendChild(empty)
                } else {
                    const ol = document.createElement('ol')
                    ol.style.paddingLeft = '18px'
                    list.forEach((entry) => {
                        const li = document.createElement('li')
                        li.style.marginBottom = '8px'
                        li.textContent = `${entry.username} — ${entry.score}`
                        ol.appendChild(li)
                    })
                    panel.appendChild(ol)
                }

                const close = document.createElement('button')
                close.textContent = 'Close'
                Object.assign(close.style, {
                    marginTop: '12px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#222',
                    color: 'white'
                })
                close.addEventListener('click', () => overlay.remove())
                panel.appendChild(close)

                overlay.appendChild(panel)
                document.body.appendChild(overlay)
            } catch (err) {
                console.error('Could not load leaderboard:', err)
                alert('Failed to load leaderboard.')
            }
        })
    }

    const mainBtn = document.querySelector('#mainMenuButton')
    if (mainBtn) {
        mainBtn.addEventListener('click', () => {
            audio.select.play()

            // Stop the game loop
            gameState.game.active = false

            // Hide screens
            document.querySelector('#restartScreen').style.display = 'none'
            document.querySelector('#scoreContainer').style.display = 'none'

            // Stop and reset background music
            audio.backgroundMusic.stop()

            // Reset game state
            gameState.reset()

            // Trigger GameContext resetGame to show start screen
            const {resetGame} = window.__gameContext || {}
            if (resetGame) {
                resetGame()
            } else {
                // Fallback if context not available
                document.querySelector('#startScreen').style.display = 'flex'
            }
        })
    }
}
