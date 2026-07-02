import { Howl } from 'howler'
import { useEffect, useMemo } from 'react'

import correctSoundFile from '../assets/sound-effect/correct.mp3'
import timeSoundFile from '../assets/sound-effect/time.mp3'
import timeUpSoundFile from '../assets/sound-effect/times_up.mp3'
import wrongSoundFile from '../assets/sound-effect/wrong.mp3'

type SoundName = 'correct' | 'time' | 'timeUp' | 'wrong'

// Background loop that keeps playing under one-off stinger sounds instead of being cut off by them.
const AMBIENT_SOUNDS: SoundName[] = ['time']

type SoundCollection = Record<SoundName, Howl>

let sharedSounds: SoundCollection | null = null
let activeConsumers = 0

function logSoundWarning(soundName: SoundName, action: 'load' | 'play', error?: unknown) {
  console.warn(`[sound-effects] Failed to ${action} "${soundName}" sound.`, error)
}

function createSound(soundName: SoundName, src: string, volume: number, loop = false): Howl {
  return new Howl({
    src: [src],
    format: ['mp3'],
    html5: true,
    preload: false,
    volume,
    loop,
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
    timeUp: createSound('timeUp', timeUpSoundFile, 0.82),
    time: createSound('time', timeSoundFile, 0.5, true),
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

    function stopStingers() {
      Object.entries(sounds).forEach(([name, sound]) => {
        if (!AMBIENT_SOUNDS.includes(name as SoundName)) {
          sound.stop()
        }
      })
    }

    function play(soundName: SoundName) {
      stopStingers()

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
      playTime: (positionSeconds = 0) => {
        if (sounds.time.playing()) {
          return
        }

        try {
          const id = sounds.time.play()
          // html5 audio has no known duration until playback actually starts, so an
          // immediate seek() silently no-ops — wait for the "play" event before seeking.
          sounds.time.once(
            'play',
            () => {
              sounds.time.seek(positionSeconds, id)
            },
            id,
          )
        } catch (error) {
          logSoundWarning('time', 'play', error)
        }
      },
      playTimeUp: () => {
        play('timeUp')
      },
      playWrong: () => {
        play('wrong')
      },
      setTimeVolume: (volume: number) => {
        sounds.time.volume(volume)
      },
      stopTime: () => {
        sounds.time.stop()
      },
      stopAll,
    }
  }, [sounds])

  return api
}
