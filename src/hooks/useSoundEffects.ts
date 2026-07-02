import { Howl } from 'howler'
import { useEffect, useMemo } from 'react'

import correctSoundFile from '../assets/sound-effect/correct.mp3'
import tickingSoundFile from '../assets/sound-effect/tik_tik.mp3'
import timeUpSoundFile from '../assets/sound-effect/times_up.mp3'
import wrongSoundFile from '../assets/sound-effect/wrong.mp3'

type SoundName = 'correct' | 'tick' | 'timeUp' | 'wrong'

type SoundCollection = Record<SoundName, Howl>

let sharedSounds: SoundCollection | null = null
let activeConsumers = 0

function logSoundWarning(soundName: SoundName, action: 'load' | 'play', error?: unknown) {
  console.warn(`[sound-effects] Failed to ${action} "${soundName}" sound.`, error)
}

function createSound(soundName: SoundName, src: string, volume: number): Howl {
  return new Howl({
    src: [src],
    format: ['mp3'],
    html5: true,
    preload: false,
    volume,
    onloaderror: (_, error) => {
      logSoundWarning(soundName, 'load', error)
    },
    onplayerror: (_, error) => {
      logSoundWarning(soundName, 'play', error)
    },
  })
}

function getSharedSounds(): SoundCollection {
  if (sharedSounds) {
    return sharedSounds
  }

  sharedSounds = {
    correct: createSound('correct', correctSoundFile, 0.75),
    wrong: createSound('wrong', wrongSoundFile, 0.75),
    tick: createSound('tick', tickingSoundFile, 0.68),
    timeUp: createSound('timeUp', timeUpSoundFile, 0.82),
  }

  return sharedSounds
}

function unloadSharedSounds() {
  if (!sharedSounds) {
    return
  }

  Object.values(sharedSounds).forEach((sound) => sound.unload())
  sharedSounds = null
}

export function useSoundEffects() {
  const sounds = useMemo(() => getSharedSounds(), [])

  useEffect(() => {
    activeConsumers += 1

    return () => {
      activeConsumers -= 1

      if (activeConsumers <= 0) {
        activeConsumers = 0
        unloadSharedSounds()
      }
    }
  }, [])

  const api = useMemo(() => {
    function stopAll() {
      Object.values(sounds).forEach((sound) => sound.stop())
    }

    function play(soundName: SoundName) {
      stopAll()

      try {
        sounds[soundName].play()
      } catch (error) {
        logSoundWarning(soundName, 'play', error)
      }
    }

    return {
      playCorrect: () => {
        play('correct')
      },
      playTick: () => {
        play('tick')
      },
      playTimeUp: () => {
        play('timeUp')
      },
      playWrong: () => {
        play('wrong')
      },
      stopAll,
    }
  }, [sounds])

  return api
}
