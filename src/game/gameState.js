// javascript
export class GameState {
  constructor() {
    this.player = null
    this.projectiles = []
    this.grids = []
    this.invaderProjectiles = []
    this.particles = []
    this.bombs = []
    this.powerUps = []
    this.keys = {
      a: { pressed: false },
      d: { pressed: false },
      space: { pressed: false }
    }
    this.frames = 0
    // Spawn sooner: 150–349 frames (~2.5–5.8s)
    this.randomInterval = Math.floor(Math.random() * 200 + 150)
    this.game = {
      over: false,
      active: true
    }
    this.score = 0
    // Start with a smaller buffer
    this.spawnBuffer = 150
    this.fps = 60
    this.fpsInterval = 1000 / this.fps
    this.msPrev = window.performance.now()
  }

  reset() {
    this.player = null
    this.projectiles = []
    this.grids = []
    this.invaderProjectiles = []
    this.particles = []
    this.bombs = []
    this.powerUps = []
    this.keys = {
      a: { pressed: false },
      d: { pressed: false },
      space: { pressed: false }
    }
    this.frames = 0
    this.randomInterval = Math.floor(Math.random() * 200 + 150)
    this.game = {
      over: false,
      active: true
    }
    this.score = 0
    this.spawnBuffer = 150
    this.msPrev = window.performance.now()
  }
}
