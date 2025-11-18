// src/game/index.js
import { Player } from './entities/Player'
import { Projectile } from './entities/Projectile'
import { rectangularCollision } from './util'
import { audio } from './audio'
import { GameState } from './gameState'
import { createStarfield } from './effects'
import {
  spawnPowerUps,
  spawnBombs,
  spawnEnemies,
  handleProjectileCollisions,
  handleGridCollisions,
  endGame
} from './gameLogic'
import { setupKeyboardControls, setupUIHandlers } from './eventHandlers'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const gameState = new GameState()
let animationId = null

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

resizeCanvas()
window.addEventListener('resize', resizeCanvas)

function init() {
  gameState.reset()
  gameState.player = new Player()

  document.querySelector('#finalScore').innerHTML = gameState.score
  document.querySelector('#scoreEl').innerHTML = gameState.score

  // populate HUD with current user/context if available
  try {
    const ctx = window.__gameContext || {}
    const user = ctx.user || {}
    const hudUsername = document.querySelector('#hudUsername')
    const hudCoins = document.querySelector('#hudCoins')
    const hudSkin = document.querySelector('#hudSkin')
    const hudSwatch = document.querySelector('#hudProjectileSwatch')
    if (hudUsername) hudUsername.innerText = user.username || 'guest'
    if (hudCoins) hudCoins.innerText = typeof user.coins === 'number' ? user.coins : 0
    if (hudSkin) hudSkin.innerText = user?.skin?.equipped || user?.skin || 'default'
    if (hudSwatch) {
      const equippedColor = user?.projectile?.equippedColor || 'lightblue'
      hudSwatch.style.background = equippedColor
    }
  } catch (e) {
    // ignore
  }

  createStarfield(canvas, gameState.particles)
  // HUD lives if available on player
  try {
    const hudLives = document.querySelector('#hudLives')
    if (hudLives) hudLives.innerText = (gameState.player && typeof gameState.player.lives === 'number') ? gameState.player.lives : '-'
  } catch (e) {}
}

function updatePowerUps(canvas) {
  for (let i = gameState.powerUps.length - 1; i >= 0; i--) {
    const powerUp = gameState.powerUps[i]
    if (powerUp.position.x - powerUp.radius >= canvas.width) {
      gameState.powerUps.splice(i, 1)
    } else {
      powerUp.update()
    }
  }
}

function updateBombs() {
  for (let i = gameState.bombs.length - 1; i >= 0; i--) {
    const bomb = gameState.bombs[i]
    if (bomb.opacity <= 0) {
      gameState.bombs.splice(i, 1)
    } else {
      bomb.update()
    }
  }
}

function updatePlayer() {
  gameState.player.update()

  for (let i = gameState.player.particles.length - 1; i >= 0; i--) {
    const particle = gameState.player.particles[i]
    particle.update()
    if (particle.opacity === 0) {
      gameState.player.particles.splice(i, 1)
    }
  }
}

function updateParticles(canvas) {
  gameState.particles.forEach((particle, i) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width
      particle.position.y = -particle.radius
    }

    if (particle.opacity <= 0) {
      setTimeout(() => {
        gameState.particles.splice(i, 1)
      }, 0)
    } else {
      particle.update()
    }
  })
}

function updateInvaderProjectiles(canvas) {
  gameState.invaderProjectiles.forEach((invaderProjectile, index) => {
    if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
      setTimeout(() => {
        gameState.invaderProjectiles.splice(index, 1)
      }, 0)
    } else {
      invaderProjectile.update()
    }

    if (rectangularCollision({ rectangle1: invaderProjectile, rectangle2: gameState.player })) {
      gameState.invaderProjectiles.splice(index, 1)
      endGame(gameState, gameState.player, canvas)
    }
  })
}

function handlePlayerMovement(canvas) {
  if (gameState.keys.a.pressed && gameState.player.position.x >= 0) {
    gameState.player.velocity.x = -7
    gameState.player.rotation = -0.15
  } else if (gameState.keys.d.pressed && gameState.player.position.x + gameState.player.width <= canvas.width) {
    gameState.player.velocity.x = 7
    gameState.player.rotation = 0.15
  } else {
    gameState.player.velocity.x = 0
    gameState.player.rotation = 0
  }
}

function handleMachineGun() {
  if (
      gameState.keys.space.pressed &&
      gameState.player.powerUp === 'MachineGun' &&
      gameState.frames % 2 === 0 &&
      !gameState.game.over
  ) {
    if (gameState.frames % 6 === 0) audio.shoot.play()
    const { user } = window.__gameContext || {}
    const projColor = user?.projectile?.equippedColor || 'lightblue'
    gameState.projectiles.push(
        new Projectile({
          position: {
            x: gameState.player.position.x + gameState.player.width / 2,
            y: gameState.player.position.y
          },
          velocity: { x: 0, y: -10 },
          color: projColor
        })
    )
  }
}

function animate() {
  if (!gameState.game.active) {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    return
  }

  animationId = requestAnimationFrame(animate)

  const msNow = window.performance.now()
  const elapsed = msNow - gameState.msPrev

  if (elapsed < gameState.fpsInterval) return

  gameState.msPrev = msNow - (elapsed % gameState.fpsInterval)

  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)

  updatePowerUps(canvas)
  spawnPowerUps(gameState, canvas)

  updateBombs()
  spawnBombs(gameState, canvas)

  updatePlayer()
  updateParticles(canvas)
  updateInvaderProjectiles(canvas)

  handleProjectileCollisions(gameState, canvas, gameState.player)
  handleGridCollisions(gameState, gameState.player, canvas)
  handlePlayerMovement(canvas)

  spawnEnemies(gameState)
  handleMachineGun()

  gameState.frames++
}

document.querySelector('#startButton').addEventListener('click', () => {
  audio.backgroundMusic.play()
  audio.start.play()

  document.querySelector('#startScreen').style.display = 'none'
  document.querySelector('#scoreContainer').style.display = 'block'

  // Force context update before init
  const ctx = window.__gameContext || {}
  const user = ctx.user || {}

  // Update HUD immediately with latest context data
  try {
    const hudUsername = document.querySelector('#hudUsername')
    const hudCoins = document.querySelector('#hudCoins')
    const hudSkin = document.querySelector('#hudSkin')
    const hudSwatch = document.querySelector('#hudProjectileSwatch')
    const hudLives = document.querySelector('#hudLives')

    if (hudUsername) hudUsername.innerText = user.username || 'guest'
    if (hudCoins) hudCoins.innerText = typeof user.coins === 'number' ? user.coins : 0
    if (hudSkin) hudSkin.innerText = user?.skin?.equipped || user?.skin || 'default'
    if (hudSwatch) {
      const equippedColor = user?.projectile?.equippedColor || 'lightblue'
      hudSwatch.style.background = equippedColor
    }
    if (hudLives && gameState.player) {
      hudLives.innerText = typeof gameState.player.lives === 'number' ? gameState.player.lives : '-'
    }
  } catch (e) {
    console.error('HUD update error:', e)
  }

  init()
  animate()
})


// Update HUD when user data changes (dispatched by GameContext)
window.addEventListener('userCoinsUpdated', (e) => {
  try {
    const user = e.detail || window.__gameContext?.user || {}
    const hudUsername = document.querySelector('#hudUsername')
    const hudCoins = document.querySelector('#hudCoins')
    const hudSkin = document.querySelector('#hudSkin')
    const hudSwatch = document.querySelector('#hudProjectileSwatch')
    const hudSkinImg = document.querySelector('#hudSkinImg')
    const hudRole = document.querySelector('#hudRole')
    if (hudUsername) hudUsername.innerText = user.username || 'guest'
    if (hudCoins) {
      const newVal = typeof user.coins === 'number' ? user.coins : hudCoins.innerText
      // animate when coins increase
      try {
        if (Number(newVal) > Number(hudCoins.innerText || 0)) {
          hudCoins.classList.add('hud-coin-bump')
          hudCoins.addEventListener('animationend', () => hudCoins.classList.remove('hud-coin-bump'), { once: true })
        }
      } catch (e) {}
      hudCoins.innerText = newVal
    }
    if (hudSkin) hudSkin.innerText = user?.skin?.equipped || user?.skin || hudSkin.innerText
    if (hudSwatch) hudSwatch.style.background = (user?.projectile?.equippedColor) || hudSwatch.style.background
    if (hudSkinImg) {
      const skinImage = user?.skin?.image || user?.skinImage || null
      if (skinImage) hudSkinImg.src = skinImage
      else hudSkinImg.src = '/img/spaceship.png'
    }
    if (hudRole) hudRole.innerText = user.role || 'player'
  } catch (err) {
    // ignore
  }
})

window.addEventListener('projectileColorChanged', (e) => {
  try {
    const color = e.detail?.color || 'lightblue'
    const hudSwatch = document.querySelector('#hudProjectileSwatch')
    if (hudSwatch) {
      hudSwatch.style.background = color
    }
  } catch (err) {
    // ignore
  }
})

const restartBtn = document.querySelector('#restartButton')
if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    audio.select.play()
    document.querySelector('#restartScreen').style.display = 'none'
    document.querySelector('#scoreContainer').style.display = 'block'

    init()
    animate()
  })
}

setupUIHandlers(gameState)
setupKeyboardControls(gameState)
