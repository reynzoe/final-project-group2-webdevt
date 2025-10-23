// javascript
export function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
      rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
      rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
      rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
      rectangle1.position.y <= rectangle2.position.y + rectangle2.height
  )
}