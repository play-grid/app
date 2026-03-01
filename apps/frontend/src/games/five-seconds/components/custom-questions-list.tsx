import { TrashIcon } from '@playgrid/ui/icons';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCustomQuestionsStore } from '../stores/custom-questions-store';

import { CategoryCombobox } from './category-combobox';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function CustomQuestionsList() {
  const { t } = useTranslation();
  const { customQuestions, updateQuestion, removeQuestion } = useCustomQuestionsStore();

  if (customQuestions.length === 0) {
    return null;
  }

  return (
    <div className="pt-4 border-t">
      <h3 className="text-lg font-semibold mb-4">{t('fiveSecondsGame.customQuestions.title')}</h3>
      <ScrollArea className="space-y-4 max-h-96 overflow-y-auto">
        {customQuestions.map(question => (
          <Card key={question.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-normal leading-relaxed">
                {question.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">{t('fiveSecondsGame.lobby.difficulty')}</Label>
                  <Select
                    value={question.difficulty}
                    onValueChange={(value: 'easy' | 'medium' | 'hard') =>
                      updateQuestion(question.id, { difficulty: value })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">{t('easy')}</SelectItem>
                      <SelectItem value="medium">{t('medium')}</SelectItem>
                      <SelectItem value="hard">{t('hard')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('fiveSecondsGame.lobby.categories')}</Label>
                  <CategoryCombobox
                    value={question.categoryId}
                    onChange={value => updateQuestion(question.id, { categoryId: value })}
                  />
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeQuestion(question.id)}
                className="w-full"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                {t('common.delete')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
    </div>
  );
}
