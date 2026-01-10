import { difficultySchema } from '@guess-logo/five-seconds';
import { UploadIcon } from '@guess-logo/ui/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toast } from 'sonner';
import { useCategories } from '../hooks/use-categories';
import { useCustomQuestionsStore } from '../stores/custom-questions-store';
import { getLocalizedCategoryName } from '../utils/category-utils';
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
  difficulty: 'easy' | 'medium' | 'hard';
}

export function BulkImportDialog({ children }: BulkImportDialogProps) {
  const { t, i18n } = useTranslation();
  const { data: categories } = useCategories();

  const [isOpen, setIsOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const parsedQuestions = parseBulkText(bulkText);
  const addQuestions = useCustomQuestionsStore(state => state.addQuestions);

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

    setIsOpen(false);
    setBulkText('');
    setSelectedCategory('');
    setSelectedDifficulty('medium');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <UploadIcon className="w-4 h-4 mr-2" />
            {t('fiveSecondsGame.bulkImport.title')}
          </Button>
        )}
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
              className="min-h-30"
            />
            <p className="text-sm text-muted-foreground">
              {t('fiveSecondsGame.bulkImport.hint')}
            </p>
          </div>

          {/* Bulk Assignment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('fiveSecondsGame.bulkImport.category')}</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('fiveSecondsGame.bulkImport.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {getLocalizedCategoryName(cat, i18n.language.startsWith('ar') ? 'ar' : 'en')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto bg-muted/50">
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            {t('cancel')}
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
