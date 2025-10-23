export class Particle {
  constructor({ position, velocity, radius = 2, color = 'white', fades = false }) {
    this.position = { ...position }
    this.velocity = { ...velocity }
    this.radius = radius
    this.color = color
    this.opacity = 1
    this.fades = fades
  }

  draw(ctx) {
    const c = ctx || document.querySelector('canvas')?.getContext('2d')
    if (!c) return
    c.save()
    c.globalAlpha = this.opacity
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  update(ctx) {
    this.draw(ctx)
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    if (this.fades) this.opacity = Math.max(0, this.opacity - 0.01)
  }
}

export class Bomb {
  static radius = 30

  constructor({ position, velocity }) {
    this.position = { ...position }
    this.velocity = { ...velocity }
    this.radius = 0
    this.color = 'red'
    this.opacity = 1
    this.active = false
    this.growthRate = 2 // For animation without gsap
    this.targetRadius = 30
  }

  draw(ctx) {
    const c = ctx || document.querySelector('canvas')?.getContext('2d')
    if (!c) return
    c.save()
    c.globalAlpha = this.opacity
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  update(ctx, canvasWidth, canvasHeight) {
    this.draw(ctx)

    // Grow to target radius (replacing gsap animation)
    if (this.radius < this.targetRadius) {
      this.radius = Math.min(this.radius + this.growthRate, this.targetRadius)
    }

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // Bounce off walls
    if (
        this.position.x + this.radius + this.velocity.x >= canvasWidth ||
        this.position.x - this.radius + this.velocity.x <= 0
    ) {
      this.velocity.x = -this.velocity.x
    } else if (
        this.position.y + this.radius + this.velocity.y >= canvasHeight ||
        this.position.y - this.radius + this.velocity.y <= 0
    ) {
      this.velocity.y = -this.velocity.y
    }
  }

  explode() {
    try {
      // Try to play sound if audio is available
      if (typeof audio !== 'undefined' && audio.bomb) {
        audio.bomb.play()
      }
    } catch (e) {
      console.log('Audio not available')
    }

    this.active = true
    this.velocity.x = 0
    this.velocity.y = 0
    this.targetRadius = 200
    this.color = 'white'

    // Fade out (replacing gsap animation)
    const fadeInterval = setInterval(() => {
      this.opacity -= 0.05
      if (this.opacity <= 0) {
        this.opacity = 0
        clearInterval(fadeInterval)
      }
    }, 50)
  }
}