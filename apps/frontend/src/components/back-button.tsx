import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function BackButton() {
  const navigate = useNavigate();
  const { i18n } = useTranslation('common');
  return (
    <Button variant="outline" onClick={() => navigate(-1)}>
      <Icon icon={`solar:arrow-${i18n.language === 'en' ? 'left' : 'right'}-line-duotone`} className="size-4" />
    </Button>
  );
}

export default BackButton;
