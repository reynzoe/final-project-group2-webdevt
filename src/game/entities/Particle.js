// javascript
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

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    if (this.fades) this.opacity = Math.max(0, this.opacity - 0.01)
  }
}