// javascript
export class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = { ...position }
    this.velocity = { ...velocity }
    this.width = 3
    this.height = 10
  }

  draw(ctx) {
    const c = ctx || document.querySelector('canvas')?.getContext('2d')
    if (!c) return
    c.fillStyle = 'white'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}