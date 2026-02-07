import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui/slider';
import { useGameStore } from '../stores/game-state-store';

interface GridSizeSliderProps {
  onSizeChange?: (newSize: number) => void;
}

export function GridSizeSlider({ onSizeChange }: GridSizeSliderProps) {
  const gridCols = useGameStore(state => state.gridCols);
  const setGridCols = useGameStore(state => state.setGridCols);
  const { t } = useTranslation();

  const handleValueChange = (values: number[]) => {
    const newSize = values[0];
    if (onSizeChange) {
      onSizeChange(newSize);
    }
    setGridCols(newSize);
  };

  return (
    <div className="flex items-center gap-4">
      <span>{t('grid-size')}</span>
      <Slider
        value={[gridCols]}
        onValueChange={handleValueChange}
        min={2}
        max={10}
        step={1}
      />
      <span>{gridCols}</span>
    </div>
  );
}
