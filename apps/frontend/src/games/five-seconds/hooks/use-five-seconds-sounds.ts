import useSound from 'use-sound';
import { env } from '@/env';
import { useSoundStore } from '../stores/sound-store';

const URL = `${env.VITE_BUCKET_URL}/sounds/fiveSeconds`;

const SOUNDS = {
  TICK: `${URL}/button-ui-tick.aac`,
  BUZZER: `${URL}/anxiety-ticks-247694.aac`,
  SUCCESS: `${URL}/postive.aac`,
  FAILURE: `${URL}/vote-down.aac`,
  START: `${URL}/Bld_H1.mp3`,
  MUSIC: `https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3`,
};

export function useFiveSecondsSounds() {
  const { isSoundEnabled, isMusicEnabled } = useSoundStore();

  const [playTick] = useSound(SOUNDS.TICK, {
    volume: 0.5,
    soundEnabled: isSoundEnabled,
    html5: true, // Use HTML5 Audio for cross-origin reliability
  });
  const [playBuzzer] = useSound(SOUNDS.BUZZER, {
    volume: 0.5,
    soundEnabled: isSoundEnabled,
    html5: true,
  });
  const [playSuccess] = useSound(SOUNDS.SUCCESS, {
    volume: 0.5,
    soundEnabled: isSoundEnabled,
    html5: true,
  });
  const [playFailure] = useSound(SOUNDS.FAILURE, {
    volume: 0.5,
    soundEnabled: isSoundEnabled,
    html5: true,
  });
  const [playStart] = useSound(SOUNDS.START, {
    volume: 0.5,
    soundEnabled: isSoundEnabled,
    html5: true,
  });

  const [playMusic, { stop: stopMusic }] = useSound(SOUNDS.MUSIC, {
    volume: 0.2,
    loop: true,
    soundEnabled: isMusicEnabled,
    html5: true, // Crucial for large files and bypassing strict CORS
  });

  return {
    playTick,
    playBuzzer,
    playSuccess,
    playFailure,
    playStart,
    playMusic,
    stopMusic,
    isSoundEnabled,
    isMusicEnabled,
  };
}
