import type { Difficulty } from '@guess-logo/five-seconds';
import { difficultySchema } from '@guess-logo/five-seconds';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toast } from 'sonner';
import { useCustomQuestionsStore } from '../stores/custom-questions-store';
import { CategoryCombobox } from './category-combobox';
import { CustomQuestionsList } from './custom-questions-list';
import { Button } from './ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';

interface BulkImportDialogProps {
  children?: React.ReactNode;
}

interface ParsedQuestion {
  text: string;
  categoryId: string;
  difficulty: Difficulty;
}

export function BulkImportDialog({ children }: BulkImportDialogProps) {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [hasImported, setHasImported] = useState(false);

  const parsedQuestions = parseBulkText(bulkText);
  const { addQuestions } = useCustomQuestionsStore();

  const handleImport = () => {
    if (!selectedCategory) {
      toast.error(t('fiveSecondsGame.bulkImport.error'), {
        description: t('fiveSecondsGame.bulkImport.selectCategory'),
      });
      return;
    }

    if (parsedQuestions.length === 0) {
      toast.error(t('fiveSecondsGame.bulkImport.error'), {
        description: t('fiveSecondsGame.bulkImport.noQuestions'),
      });
      return;
    }

    const questionsToAdd = parsedQuestions.map(q => ({
      id: crypto.randomUUID(),
      text: q.text.trim(),
      categoryId: selectedCategory || q.categoryId,
      difficulty: selectedDifficulty,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    addQuestions(questionsToAdd);

    toast(t('fiveSecondsGame.bulkImport.success'), {
      description: t('fiveSecondsGame.bulkImport.result', {
        imported: questionsToAdd.length,
        skipped: 0,
      }),
    });

    setHasImported(true);
    setBulkText('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setHasImported(false);
      setBulkText('');
      setSelectedCategory('');
      setSelectedDifficulty('medium');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('fiveSecondsGame.bulkImport.title')}</DialogTitle>
          <DialogDescription>
            {t('fiveSecondsGame.bulkImport.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bulk Text Input */}
          <div className="space-y-2">
            <Label htmlFor="bulk-text">{t('fiveSecondsGame.bulkImport.pasteText')}</Label>
            <Textarea
              id="bulk-text"
              placeholder={t('fiveSecondsGame.bulkImport.placeholder')}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              maxLength={5000}
              className="min-h-30 resize-none max-w-full wrap-break-word whitespace-pre-wrap field-sizing-fixed"
            />
            <p className="text-sm text-muted-foreground">
              {t('fiveSecondsGame.bulkImport.hint')}
            </p>
          </div>

          {/* Bulk Assignment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('fiveSecondsGame.bulkImport.category')}</Label>
              <CategoryCombobox
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder={t('fiveSecondsGame.bulkImport.selectCategory')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('fiveSecondsGame.bulkImport.difficulty')}</Label>
              <Select
                value={selectedDifficulty}
                onValueChange={value => setSelectedDifficulty(value as 'easy' | 'medium' | 'hard')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultySchema.options.map(diff => (
                    <SelectItem key={diff} value={diff}>
                      {t(diff.toLowerCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-2">
              <Label>{t('fiveSecondsGame.bulkImport.preview')}</Label>
              <div className="border p-3 max-h-40 overflow-y-auto bg-muted/50">
                <div className="text-sm space-y-1">
                  {parsedQuestions.slice(0, 10).map((question, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={index} className="truncate">
                      {index + 1}
                      .
                      {question.text}
                    </div>
                  ))}
                  {parsedQuestions.length > 10 && (
                    <div className="text-muted-foreground">
                      ...
                      {' '}
                      {t('fiveSecondsGame.bulkImport.andMore', { count: parsedQuestions.length - 10 })}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('fiveSecondsGame.bulkImport.totalQuestions', { count: parsedQuestions.length })}
              </p>
            </div>
          )}
          {hasImported && <CustomQuestionsList />}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedQuestions.length === 0 || !selectedCategory}
          >
            {t('fiveSecondsGame.bulkImport.import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function parseBulkText(text: string): ParsedQuestion[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length >= 5)
    .map(text => ({
      text,
      categoryId: '',
      difficulty: 'medium' as const,
    }));
}
