// javascript
export class PowerUp {
    constructor({ position, velocity, radius = 10 }) {
        this.position = { ...position }
        this.velocity = { ...velocity }
        this.radius = radius
        this.color = 'gold'
    }

    draw(ctx) {
        const c = ctx || document.querySelector('canvas')?.getContext('2d')
        if (!c) return
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}