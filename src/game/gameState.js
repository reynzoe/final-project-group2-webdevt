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
    this.randomInterval = Math.floor(Math.random() * 500 + 500)
    this.game = {
      over: false,
      active: true
    }
    this.score = 0
    this.spawnBuffer = 500
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
    this.randomInterval = Math.floor(Math.random() * 500 + 500)
    this.game = {
      over: false,
      active: true
    }
    this.score = 0
    this.spawnBuffer = 500
    this.msPrev = window.performance.now()
  }
}
