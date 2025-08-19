import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'

export function GameInstructions() {
  const { t } = useTranslation()
  return (
    <Card className="mt-8 p-4">
      <h3 className="font-semibold mb-2">{t('instructions.title')}</h3>
      <div className="text-sm text-muted-foreground space-y-1">
        <p>{t('instructions.step1')}</p>
        <p>{t('instructions.step2')}</p>
        <p>{t('instructions.step3')}</p>
        <p>{t('instructions.step4')}</p>
      </div>
    </Card>
  )
}
