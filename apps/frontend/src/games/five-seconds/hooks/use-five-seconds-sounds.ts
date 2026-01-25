import useSound from 'use-sound';
import { useSoundStore } from '../stores/sound-store';

const SOUNDS = {
  // Using stable Amazon S3 assets from FreeCodeCamp for reliability (CORS friendly)
  TICK: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-2.mp3',
  BUZZER: 'https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3',
  SUCCESS: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-1.mp3',
  FAILURE: 'https://s3.amazonaws.com/freecodecamp/drums/Heater-6.mp3',
  START: 'https://s3.amazonaws.com/freecodecamp/drums/Bld_H1.mp3',
  MUSIC: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',
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
