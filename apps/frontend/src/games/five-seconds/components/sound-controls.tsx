import { Volume2, VolumeX } from 'lucide-react';
import { useSoundStore } from '../stores/sound-store';
import { Button } from './ui/button';

interface SoundControlsProps {
  className?: string;
}

export function SoundControls({ className }: SoundControlsProps) {
  const { isSoundEnabled, toggleSound } = useSoundStore();

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* <Button
        variant="outline"
        size="sm"
        onClick={toggleMusic}
        title={isMusicEnabled ? 'Mute Music' : 'Unmute Music'}
        className="gap-2"
      >
        {isMusicEnabled ? <Music2 className="w-4 h-4 text-primary" /> : <Music className="w-4 h-4 text-muted-foreground" />}
        <span className="hidden sm:inline">Music</span>
      </Button> */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSound}
        title={isSoundEnabled ? 'Mute SFX' : 'Unmute SFX'}
        className="gap-2"
      >
        {isSoundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
        <span className="hidden sm:inline">SFX</span>
      </Button>
    </div>
  );
}
