import { Projectile } from './entities/Projectile'
import { Grid } from './entities/Grid'
import { PowerUp } from './entities/PowerUp'
import { Bomb } from './entities/Bomb'
import { rectangularCollision, randomBetween } from './util'
import { audio } from './audio'
import { submitScore } from '../api/leaderboard.js'
import { createParticles, createScoreLabel } from './effects'

export function endGame(gameState, player, canvas) {
  console.log('you lose')
  audio.gameOver.play()

  setTimeout(() => {
    player.opacity = 0
    gameState.game.over = true
  }, 0)

  setTimeout(() => {
    gameState.game.active = false
    document.querySelector('#restartScreen').style.display = 'flex'
    document.querySelector('#finalScore').innerHTML = gameState.score

    const { user, token } = window.__gameContext || {}
    if (user && token) {
      submitScore({ username: user.username, score: gameState.score, token })
        .then((doc) => console.log('Score saved:', doc))
        .catch((err) => console.error('Failed to save score:', err))
    }
  }, 2000)

  createParticles({ object: player, color: 'white', fades: true }, gameState.particles)
}

export function spawnPowerUps(gameState, canvas) {
  if (gameState.frames % 500 === 0) {
    gameState.powerUps.push(
      new PowerUp({
        position: {
          x: 0,
          y: Math.random() * 300 + 15
        },
        velocity: {
          x: 5,
          y: 0
        }
      })
    )
  }
}

export function spawnBombs(gameState, canvas) {
  if (gameState.frames % 200 === 0 && gameState.bombs.length < 3) {
    gameState.bombs.push(
      new Bomb({
        position: {
          x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),
          y: randomBetween(Bomb.radius, canvas.height - Bomb.radius)
        },
        velocity: {
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 6
        }
      })
    )
  }
}

export function spawnEnemies(gameState) {
  if (gameState.frames % gameState.randomInterval === 0) {
    gameState.spawnBuffer = gameState.spawnBuffer < 0 ? 100 : gameState.spawnBuffer
    gameState.grids.push(new Grid())
    gameState.randomInterval = Math.floor(Math.random() * 500 + gameState.spawnBuffer)
    gameState.frames = 0
    gameState.spawnBuffer -= 100
  }
}

export function handleProjectileCollisions(gameState, canvas, player) {
  for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
    const projectile = gameState.projectiles[i]

    // Check bomb collisions
    for (let j = gameState.bombs.length - 1; j >= 0; j--) {
      const bomb = gameState.bombs[j]
      if (
        Math.hypot(
          projectile.position.x - bomb.position.x,
          projectile.position.y - bomb.position.y
        ) < projectile.radius + bomb.radius && !bomb.active
      ) {
        gameState.projectiles.splice(i, 1)
        bomb.explode()
      }
    }

    // Check powerup collisions
    for (let j = gameState.powerUps.length - 1; j >= 0; j--) {
      const powerUp = gameState.powerUps[j]
      if (
        Math.hypot(
          projectile.position.x - powerUp.position.x,
          projectile.position.y - powerUp.position.y
        ) < projectile.radius + powerUp.radius
      ) {
        gameState.projectiles.splice(i, 1)
        gameState.powerUps.splice(j, 1)
        player.powerUp = 'MachineGun'
        audio.bonus.play()

        setTimeout(() => {
          player.powerUp = null
        }, 5000)
      }
    }

    if (projectile.position.y + projectile.radius <= 0) {
      gameState.projectiles.splice(i, 1)
    } else {
      projectile.update()
    }
  }
}

export function handleGridCollisions(gameState, player, canvas) {
  const scoreEl = document.querySelector('#scoreEl')

  gameState.grids.forEach((grid, gridIndex) => {
    grid.update()

    if (gameState.frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(
        gameState.invaderProjectiles
      )
    }

    for (let i = grid.invaders.length - 1; i >= 0; i--) {
      const invader = grid.invaders[i]
      invader.update({ velocity: grid.velocity })

      // Bomb collisions
      for (let j = gameState.bombs.length - 1; j >= 0; j--) {
        const bomb = gameState.bombs[j]
        const invaderRadius = 15

        if (
          Math.hypot(
            invader.position.x - bomb.position.x,
            invader.position.y - bomb.position.y
          ) < invaderRadius + bomb.radius && bomb.active
        ) {
          gameState.score += 50
          scoreEl.innerHTML = gameState.score
          grid.invaders.splice(i, 1)
          createScoreLabel({ object: invader, score: 50 })
          createParticles({ object: invader, fades: true }, gameState.particles)
        }
      }

      // Projectile collisions
      gameState.projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find((invader2) => invader2 === invader)
            const projectileFound = gameState.projectiles.find((projectile2) => projectile2 === projectile)

            if (invaderFound && projectileFound) {
              gameState.score += 100
              scoreEl.innerHTML = gameState.score

              createScoreLabel({ object: invader })
              createParticles({ object: invader, fades: true }, gameState.particles)

              audio.explode.play()
              grid.invaders.splice(i, 1)
              gameState.projectiles.splice(j, 1)

              if (grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0]
                const lastInvader = grid.invaders[grid.invaders.length - 1]
                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                grid.position.x = firstInvader.position.x
              } else {
                gameState.grids.splice(gridIndex, 1)
              }
            }
          }, 0)
        }
      })

      // Player collision
      if (rectangularCollision({ rectangle1: invader, rectangle2: player }) && !gameState.game.over) {
        endGame(gameState, player, canvas)
      }
    }
  })
}

