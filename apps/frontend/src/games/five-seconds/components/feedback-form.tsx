import type { InferRequestType, InferResponseType } from 'hono/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
const feedbackEndpoint = client.api.games['five-seconds'].questions.feedback.$post;

type FeedbackType = InferResponseType<typeof feedbackTypesEndpoint>[number];

interface FeedbackFormProps {
  questionId: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ questionId, onSuccess }: FeedbackFormProps) {
  const { t } = useTranslation();
  const { user } = useSession();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>();
  const [comment, setComment] = useState('');

  const { data: feedbackTypes = [] } = useQuery({
    queryKey: ['feedbackTypes'],
    queryFn: async () => {
      const res = await feedbackTypesEndpoint({});
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return res.json();
    },
  });

  const { mutate: submitFeedback } = useMutation({
    mutationFn: async (
      variables: Omit<InferRequestType<typeof feedbackEndpoint>['json'], 'playerId'>,
    ) => {
      const res = await feedbackEndpoint({
        json: {
          ...variables,
          playerId: user?.id,
        },
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    onSuccess: () => {
      toast.success(t('feedback.successMessage'));
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Error submitting feedback:', error);
      toast.error(t('feedback.errorMessage'));
    },
  });

  // TODO: This is a temporary implementation for showing toast messages.
  // In a real application, you might want to use a more sophisticated notification system
  // or handle specific error messages from the API.
  const handleSubmit = async () => {
    if (!feedbackType) {
      toast.error(t('feedback.noFeedbackTypeSelected'));
      return;
    }
    submitFeedback({
      questionId,
      type: feedbackType,
      comment,
    });
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
