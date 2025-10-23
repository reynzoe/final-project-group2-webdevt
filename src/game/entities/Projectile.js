// javascript
export class Projectile {
  constructor({ position, velocity, color = 'white', radius = 3 }) {
    this.position = { ...position }
    this.velocity = { ...velocity }
    this.radius = radius
    this.color = color
  }

  draw(ctx) {
    const c = ctx || document.querySelector('canvas')?.getContext('2d')
    if (!c) return
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = this.color
    c.fill()
    c.closePath()
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}