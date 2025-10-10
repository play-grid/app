import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function BackButton() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  return (
    <Button variant="outline" onClick={() => navigate(-1)}>
      <Icon icon="solar:arrow-left-line-duotone" className="size-4" />
      {t('back')}
    </Button>
  );
}

export default BackButton;
