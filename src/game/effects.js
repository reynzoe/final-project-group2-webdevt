import { Particle } from './entities/Particle'

export function createParticles({ object, color = 'white', fades = false, count = 15 }, particles) {
  for (let i = 0; i < count; i++) {
    particles.push(
      new Particle({
        position: {
          x: object.position.x + (object.width ? object.width / 2 : 0),
          y: object.position.y + (object.height ? object.height / 2 : 0)
        },
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 4
        },
        radius: Math.random() * 2 + 1,
        color,
        fades
      })
    )
  }
}

export function createScoreLabel({ object, score = 100 }) {
  const el = document.createElement('div')
  el.textContent = `+${score}`
  el.style.position = 'absolute'
  el.style.left = `${object.position.x}px`
  el.style.top = `${object.position.y}px`
  el.style.color = 'white'
  el.style.fontSize = '14px'
  el.style.pointerEvents = 'none'
  el.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out'
  document.body.appendChild(el)
  requestAnimationFrame(() => {
    el.style.transform = 'translateY(-20px)'
    el.style.opacity = '0'
  })
  setTimeout(() => el.remove(), 650)
}

export function createStarfield(canvas, particles) {
  for (let i = 0; i < 100; i++) {
    particles.push(
      new Particle({
        position: {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height
        },
        velocity: {
          x: 0,
          y: 0.3
        },
        radius: Math.random() * 2,
        color: 'white'
      })
    )
  }
}

