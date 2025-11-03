import type { InferResponseType } from 'hono/client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSession } from '@/hooks/auth-hooks';
import client from '@/lib/hono-client';

const feedbackTypesEndpoint = client.api.games['five-seconds'].questions.feedback.types.$get;

type FeedbackType = InferResponseType<typeof feedbackTypesEndpoint>[number];

interface FeedbackFormProps {
  questionId: string;
}

export function FeedbackForm({ questionId }: FeedbackFormProps) {
  const { t } = useTranslation();
  const { user } = useSession();
  const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>();
  const [isCorrect, setIsCorrect] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchFeedbackTypes = async () => {
      const res = await feedbackTypesEndpoint({});
      const data = await res.json();
      setFeedbackTypes(data);
    };

    fetchFeedbackTypes();
  }, []);

  // TODO: This is a temporary implementation for showing toast messages.
  // In a real application, you might want to use a more sophisticated notification system
  // or handle specific error messages from the API.
  const handleSubmit = async () => {
    if (!feedbackType) {
      toast.error(t('feedback.noFeedbackTypeSelected'));
      return;
    }
    try {
      await client.api.games['five-seconds'].questions.feedback.$post({
        json: {
          questionId,
          type: feedbackType,
          comment,
          playerId: user?.id,
        },
      });
      toast.success(t('feedback.successMessage'));
    }
    catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(t('feedback.errorMessage'));
    }
  };

  const handleFeedbackTypeChange = (value: string) => {
    setFeedbackType(value as FeedbackType);
  };

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <h4 className="font-medium leading-none">{t('feedback.title')}</h4>
        <p className="text-sm text-muted-foreground">{t('feedback.description')}</p>
      </div>
      <div className="grid gap-2">
        <div className="grid grid-cols-3 items-center gap-4">
          <Select onValueChange={handleFeedbackTypeChange} value={feedbackType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('feedback.type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {feedbackTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {t(`feedback.types.${type}`)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="is-correct">{t('feedback.isCorrect')}</Label>
          <Checkbox
            id="is-correct"
            checked={isCorrect}
            onCheckedChange={checked => setIsCorrect(Boolean(checked))}
          />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="comment">{t('feedback.comment')}</Label>
          <Input
            id="comment"
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="col-span-2 h-8"
          />
        </div>
      </div>
      <Button onClick={handleSubmit}>{t('feedback.submit')}</Button>
    </div>
  );
}
