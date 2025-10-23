// javascript
export class Bomb {
  static radius = 20

  constructor({ position, velocity }) {
    this.position = { ...position }
    this.velocity = { ...velocity }
    this.radius = Bomb.radius
    this.opacity = 1
    this.active = false
  }

  draw(ctx) {
    const c = ctx || document.querySelector('canvas')?.getContext('2d')
    if (!c) return
    c.save()
    c.globalAlpha = this.opacity
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = this.active ? 'orange' : 'red'
    c.fill()
    c.restore()
  }

  explode() {
    this.active = true
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    const canvas = document.querySelector('canvas')
    if (canvas) {
      if (this.position.x - this.radius <= 0 || this.position.x + this.radius >= canvas.width)
        this.velocity.x *= -1
      if (this.position.y - this.radius <= 0 || this.position.y + this.radius >= canvas.height)
        this.velocity.y *= -1
    }

    if (this.active) this.opacity = Math.max(0, this.opacity - 0.02)
  }
}