import { InvaderProjectile } from './InvaderProjectile'

export class Invader {
  constructor({ position }) {
    this.velocity = { x: 0, y: 0 }
    this.width = 30
    this.height = 20
    this.position = { ...position }

    // Add image loading with absolute path
    const image = new Image()
    image.src = '/img/invader.png' // Use absolute path
    image.onload = () => {
      const scale = 1
      this.image = image
      this.width = image.width * scale
      this.height = image.height * scale
    }
  }

  draw(ctx) {
    const c = ctx || document.querySelector('canvas')?.getContext('2d')
    if (!c) return

    if (this.image) {
      c.drawImage(
          this.image,
          this.position.x,
          this.position.y,
          this.width,
          this.height
      )
    } else {
      // Fallback if image isn't loaded
      c.fillStyle = 'lime'
      c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
  }

  update({ velocity }) {
    this.draw()
    this.position.x += velocity.x
    this.position.y += velocity.y
  }

  shoot(store) {
    store.push(
        new InvaderProjectile({
          position: { x: this.position.x + this.width / 2, y: this.position.y + this.height },
          velocity: { x: 0, y: 4 }
        })
    )
  }
}