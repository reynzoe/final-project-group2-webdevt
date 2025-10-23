// src/game/audio.js
import { Howl, Howler } from 'howler'

Howler.volume(0.5)

// Create audio with error handlers
const createAudio = (src, options = {}) => {
  const sound = new Howl({
    src,
    ...options,
    onloaderror: () => console.error(`Failed to load audio: ${src}`)
  })
  return sound
}

export const audio = {
  backgroundMusic: createAudio(['/audio/backgroundMusic.wav'], { loop: true }),
  bomb: createAudio(['/audio/bomb.mp3']),
  bonus: createAudio(['/audio/bonus.mp3'], { volume: 0.8 }),
  enemyShoot: createAudio(['/audio/enemyShoot.wav']),
  explode: createAudio(['/audio/explode.wav']),
  gameOver: createAudio(['/audio/gameOver.mp3']),
  select: createAudio(['/audio/select.mp3']),
  shoot: createAudio(['/audio/shoot.wav']),
  start: createAudio(['/audio/start.mp3'])
}