import type { Difficulty } from '@guess-logo/five-seconds';
import { difficultySchema } from '@guess-logo/five-seconds';
import { Info } from 'lucide-react';
import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  hasInlineCategory: boolean;
  hasInlineDifficulty: boolean;
}

export function BulkImportDialog({ children }: BulkImportDialogProps) {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [defaultCategory, setDefaultCategory] = useState<string>('');
  const [defaultDifficulty, setDefaultDifficulty] = useState<Difficulty>('medium');
  const [hasImported, setHasImported] = useState(false);

  const parsedQuestions = parseBulkText(bulkText, defaultCategory, defaultDifficulty);
  const { addQuestions, customCategories, addCustomCategory } = useCustomQuestionsStore();

  const handleImport = () => {
    const questionsNeedingCategory = parsedQuestions.filter(q => !q.categoryId);

    if (questionsNeedingCategory.length > 0 && !defaultCategory) {
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

    const newCategories = new Set<string>();
    parsedQuestions.forEach((q) => {
      if (q.categoryId && !customCategories.includes(q.categoryId)) {
        newCategories.add(q.categoryId);
      }
    });

    newCategories.forEach(cat => addCustomCategory(cat));

    const questionsToAdd = parsedQuestions.map(q => ({
      id: crypto.randomUUID(),
      text: q.text.trim(),
      categoryId: q.categoryId || defaultCategory,
      difficulty: q.difficulty || defaultDifficulty,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    addQuestions(questionsToAdd);

    const inlineCount = parsedQuestions.filter(q => q.hasInlineCategory || q.hasInlineDifficulty).length;
    const defaultCount = parsedQuestions.length - inlineCount;

    toast.success(t('fiveSecondsGame.bulkImport.success'), {
      description: t('fiveSecondsGame.bulkImport.importSummary', {
        count: questionsToAdd.length,
        withTags: inlineCount,
        withDefaults: defaultCount,
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
      setDefaultCategory('');
      setDefaultDifficulty('medium');
    }
  };

  const questionsWithInlineTags = parsedQuestions.filter(q => q.hasInlineCategory || q.hasInlineDifficulty).length;
  const questionsWithDefaults = parsedQuestions.length - questionsWithInlineTags;

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
          {/* Format Helper */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="space-y-1">
                <p className="font-medium">{t('fiveSecondsGame.bulkImport.smartFormat')}</p>
                <code className="text-xs block bg-muted p-2 rounded mt-1">
                  {t('fiveSecondsGame.bulkImport.formatExample1')}
                  <br />
                  {t('fiveSecondsGame.bulkImport.formatExample2')}
                  <br />
                  {t('fiveSecondsGame.bulkImport.formatExample3')}
                  <br />
                  {t('fiveSecondsGame.bulkImport.formatExample4')}
                  <br />
                  {t('fiveSecondsGame.bulkImport.formatExample5')}
                </code>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('fiveSecondsGame.bulkImport.difficultyOptions')}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Bulk Text Input */}
          <div className="space-y-2">
            <Label htmlFor="bulk-text">{t('fiveSecondsGame.bulkImport.pasteText')}</Label>
            <Textarea
              id="bulk-text"
              placeholder={t('fiveSecondsGame.bulkImport.placeholder')}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              maxLength={5000}
              className="min-h-32 resize-none font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              {t('fiveSecondsGame.bulkImport.hint')}
            </p>
          </div>

          {/* Default Settings (for questions without inline tags) */}
          <div className="space-y-3">
            <Label className="text-base">{t('fiveSecondsGame.bulkImport.defaultSettings')}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">{t('fiveSecondsGame.bulkImport.category')}</Label>
                <CategoryCombobox
                  value={defaultCategory}
                  onChange={setDefaultCategory}
                  placeholder={t('fiveSecondsGame.bulkImport.selectCategory')}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{t('fiveSecondsGame.bulkImport.difficulty')}</Label>
                <Select
                  value={defaultDifficulty}
                  onValueChange={value => setDefaultDifficulty(value as Difficulty)}
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
          </div>

          {/* Preview */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('fiveSecondsGame.bulkImport.preview')}</Label>
                {questionsWithInlineTags > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {t('fiveSecondsGame.bulkImport.tagsCount', {
                      withTags: questionsWithInlineTags,
                      withDefaults: questionsWithDefaults,
                    })}
                  </span>
                )}
              </div>
              <div className="border rounded-md p-3 max-h-60 overflow-y-auto bg-muted/50 space-y-2">
                {parsedQuestions.slice(0, 10).map((question, index) => {
                  const difficultyColors = {
                    easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
                    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                    hard: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
                  };

                  return (
                    <div key={index} className="text-sm flex items-start gap-2 p-2 bg-background rounded">
                      <span className="text-muted-foreground min-w-[20px]">
                        {index + 1}
                        .
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{question.text}</div>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            question.hasInlineCategory ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-muted text-muted-foreground'
                          }`}
                          >
                            {question.categoryId || defaultCategory || t('fiveSecondsGame.bulkImport.noCategory')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            question.hasInlineDifficulty
                              ? difficultyColors[question.difficulty || defaultDifficulty]
                              : 'bg-muted text-muted-foreground'
                          }`}
                          >
                            {t((question.difficulty || defaultDifficulty).toLowerCase())}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {parsedQuestions.length > 10 && (
                  <div className="text-muted-foreground text-sm text-center py-2">
                    ...
                    {' '}
                    {t('fiveSecondsGame.bulkImport.andMore', { count: parsedQuestions.length - 10 })}
                  </div>
                )}
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
            disabled={parsedQuestions.length === 0 || (questionsWithDefaults > 0 && !defaultCategory)}
          >
            {t('fiveSecondsGame.bulkImport.import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function parseBulkText(text: string, _defaultCategory: string, defaultDifficulty: Difficulty): ParsedQuestion[] {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length >= 5);
  const difficultyMap: Record<string, Difficulty> = {
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',

    سهل: 'easy',
    وسط: 'medium',
    صعب: 'hard',
  };

  return lines.map((line) => {
    const inlineMatch = line.match(/^\[([^\]]+)\](.+)$/);

    if (inlineMatch) {
      const [, tags, questionText] = inlineMatch;
      const parts = tags.split('|').map(p => p.trim());

      const category = parts[0] || '';
      const difficultyInput = parts[1]?.toLowerCase().trim();

      const mappedDifficulty = difficultyInput ? difficultyMap[difficultyInput] : undefined;
      const validDifficulty = mappedDifficulty || defaultDifficulty;

      return {
        text: questionText.trim(),
        categoryId: category,
        difficulty: validDifficulty,
        hasInlineCategory: !!category,
        hasInlineDifficulty: !!parts[1] && !!mappedDifficulty,
      };
    }

    return {
      text: line,
      categoryId: '',
      difficulty: defaultDifficulty,
      hasInlineCategory: false,
      hasInlineDifficulty: false,
    };
  });
}
