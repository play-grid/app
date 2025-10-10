import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui/slider';
import { useGameStore } from '../stores/game-state-store';

export function GridSizeSlider() {
  const gridCols = useGameStore(state => state.gridCols);
  const setGridCols = useGameStore(state => state.setGridCols);
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-4">
      <span>{t('grid-size')}</span>
      <Slider
        value={[gridCols]}
        onValueChange={([value]) => setGridCols(value)}
        min={2}
        max={10}
        step={1}
      />
      <span>{gridCols}</span>
    </div>
  );
}
