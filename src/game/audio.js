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
  backgroundMusic: createAudio(['/audio/background.mp3'], { loop: true, volume: 0.3 }),
  start: createAudio(['/audio/start.wav']),
  select: createAudio(['/audio/select.wav']),
  shoot: createAudio(['/audio/shoot.wav'], { volume: 0.6 }),
  explode: createAudio(['/audio/explode.wav'], { volume: 0.7 }),
  bonus: createAudio(['/audio/bonus.wav']),
  gameOver: createAudio(['/audio/gameover.wav'])
}