// javascript
import { Invader } from './Invader'

export class Grid {
  constructor() {
    this.position = { x: 100, y: 50 }
    this.velocity = { x: 2, y: 0 }
    this.invaders = []
    const cols = Math.floor(Math.random() * 5) + 5
    const rows = Math.floor(Math.random() * 2) + 2
    this.width = cols * 40

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        this.invaders.push(
            new Invader({
              position: { x: this.position.x + x * 40, y: this.position.y + y * 35 }
            })
        )
      }
    }
  }

  update() {
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    this.velocity.y = 0

    const canvas = document.querySelector('canvas')
    if (canvas) {
      if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
        this.velocity.x *= -1
        this.velocity.y = 20
      }
    }
  }
}