import gsap from 'gsap'
import { audio } from '../audio'

export class Bomb {
  static radius = 30

  constructor({ position, velocity }) {
    this.position = { ...position }
    this.velocity = { ...velocity }
    this.radius = 0
    this.color = 'red'
    this.opacity = 1
    this.active = false

    gsap.to(this, {
      radius: 30
    })
  }

  draw(ctx) {
    const c = ctx || document.querySelector('canvas')?.getContext('2d')
    if (!c) return
    c.save()
    c.globalAlpha = this.opacity
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.closePath()
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    const canvas = document.querySelector('canvas')
    if (canvas) {
      if (
          this.position.x + this.radius + this.velocity.x >= canvas.width ||
          this.position.x - this.radius + this.velocity.x <= 0
      ) {
        this.velocity.x = -this.velocity.x
      } else if (
          this.position.y + this.radius + this.velocity.y >= canvas.height ||
          this.position.y - this.radius + this.velocity.y <= 0
      ) {
        this.velocity.y = -this.velocity.y
      }
    }
  }

  explode() {
    audio.bomb.play()
    this.active = true
    this.velocity.x = 0
    this.velocity.y = 0

    gsap.to(this, {
      radius: 200,
      color: 'white'
    })

    gsap.to(this, {
      delay: 0.1,
      opacity: 0,
      duration: 0.15
    })
  }
}
