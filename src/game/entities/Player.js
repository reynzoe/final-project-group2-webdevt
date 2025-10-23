export class Player {
  constructor() {
    this.position = { x: 1024 / 2 - 30, y: 576 - 80 }
    this.velocity = { x: 0, y: 0 }
    this.width = 60
    this.height = 20
    this.rotation = 0
    this.opacity = 1
    this.powerUp = null
    this.particles = []

    // Load the spaceship image
    const image = new Image()
    image.src = '/img/spaceship.png' // Absolute path from public folder
    image.onload = () => {
      const scale = 0.15
      this.image = image
      this.width = image.width * scale
      this.height = image.height * scale
      this.position = {
        x: 1024 / 2 - this.width / 2,
        y: 576 - this.height - 20
      }
    }

    this.frames = 0
  }

  draw(ctx) {
    const c = ctx || document.querySelector('canvas')?.getContext('2d')
    if (!c) return

    c.save()
    c.globalAlpha = this.opacity
    c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2)
    c.rotate(this.rotation)

    if (this.image) {
      // Draw the image if loaded
      c.drawImage(
          this.image,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
      )
    } else {
      // Fallback rectangle
      c.fillStyle = 'white'
      c.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)
    }

    c.restore()
  }

  update(ctx) {
    this.draw(ctx)
    this.position.x += this.velocity.x
  }
}