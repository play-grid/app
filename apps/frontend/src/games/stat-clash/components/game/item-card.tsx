import type { GuessDirection } from '@guess-logo/stat-clash';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/card';

interface RoundItem {
  id: string;
  name: string;
  value: number;
  unit: string;
  imageUrl: string | null;
  hint: string | null;
}

interface ItemCardProps {
  item: RoundItem;
  side: GuessDirection;
  showValue: boolean;
}

export function ItemCard({ item, side, showValue }: ItemCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="p-4 sm:p-5 flex flex-col gap-4 min-h-[280px]">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {side === 'left' ? t('statClashGame.itemCard.left') : t('statClashGame.itemCard.right')}
      </div>

      <div className="aspect-16/10 overflow-hidden rounded-lg bg-muted/40 border border-border/50">
        {item.imageUrl
          ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            )
          : (
              <div className="h-full w-full grid place-items-center text-sm text-muted-foreground">
                {t('statClashGame.itemCard.noImage')}
              </div>
            )}
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-semibold leading-tight">{item.name}</h3>
        {item.hint && <p className="text-sm text-muted-foreground">{item.hint}</p>}
      </div>

      <div className="mt-auto rounded-lg border border-border bg-background/80 px-3 py-2.5">
        {showValue
          ? (
              <p className="text-base font-bold">
                {Intl.NumberFormat().format(item.value)}
                {' '}
                <span className="font-medium text-muted-foreground">{item.unit}</span>
              </p>
            )
          : (
              <p className="text-base font-semibold text-muted-foreground">{t('statClashGame.itemCard.hiddenValue')}</p>
            )}
      </div>
    </Card>
  );
}
