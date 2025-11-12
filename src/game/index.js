// src/game/index.js
import { Player } from './entities/Player'
import { Projectile } from './entities/Projectile'
import { rectangularCollision } from './util'
import { audio } from './audio'
import { GameState } from './gameState'
import { createParticles, createStarfield } from './effects'
import {
  spawnPowerUps,
  spawnBombs,
  spawnEnemies,
  handleProjectileCollisions,
  handleGridCollisions,
  endGame
} from './gameLogic'
import { setupKeyboardControls, setupUIHandlers } from './eventHandlers'

const scoreEl = document.querySelector('#scoreEl')
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const gameState = new GameState()
let animationId = null

function init() {
  gameState.reset()
  gameState.player = new Player()

  document.querySelector('#finalScore').innerHTML = gameState.score
  document.querySelector('#scoreEl').innerHTML = gameState.score

  createStarfield(canvas, gameState.particles)
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
    gameState.projectiles.push(
      new Projectile({
        position: {
          x: gameState.player.position.x + gameState.player.width / 2,
          y: gameState.player.position.y
        },
        velocity: {
          x: 0,
          y: -10
        },
        color: 'yellow'
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

  init()
  animate()
})

// Add restart button handler
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
