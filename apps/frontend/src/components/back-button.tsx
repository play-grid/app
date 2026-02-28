import { ArrowLeftIcon, ArrowRightIcon } from '@guess-logo/ui/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function BackButton() {
  const navigate = useNavigate();
  const { i18n } = useTranslation('common');
  return (
    <Button variant="outline" className='rounded-xs' onClick={() => navigate('/play')}>
      {i18n.language === 'en' ? <ArrowLeftIcon className="size-4" /> : <ArrowRightIcon className="size-4" />}
    </Button>
  );
}

export default BackButton;
