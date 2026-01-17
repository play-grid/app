import type { Difficulty } from '@guess-logo/five-seconds';
import { difficultySchema } from '@guess-logo/five-seconds';
import { X } from 'lucide-react';
import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCustomQuestionsStore } from '../stores/custom-questions-store';
import { normalizeDifficulty } from '../utils/difficulty-utils';
import { CategoryCombobox } from './category-combobox';

import { CustomQuestionsList } from './custom-questions-list';
import { Alert, AlertDescription } from './ui/alert';
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

  const canImport = parsedQuestions.length > 0 && !(questionsWithDefaults > 0 && !defaultCategory);
  const buttonLabel = bulkText.trim() ? t('fiveSecondsGame.bulkImport.import') : t('common.save');

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[90vw]! h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rtl:text-right">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{t('fiveSecondsGame.bulkImport.title')}</DialogTitle>
          <DialogDescription>
            {t('fiveSecondsGame.bulkImport.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-[60%_40%]">

          {/* LEFT COLUMN: EDITOR & SETTINGS */}
          <div className="flex flex-col h-full overflow-hidden border-r">
            <ScrollArea className="p-6 space-y-6">
              {/* Format Helper */}
              <Alert>
                {/* <Info className="h-4 w-4" /> */}
                <AlertDescription className="text-sm">
                  <p className="font-medium mx-2">{t('fiveSecondsGame.bulkImport.smartFormat')}</p>
                  <div className="space-y-1">
                    <code className="text-xs block bg-muted p-2 mt-1">
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
              <div className="space-y-3">
                <Label className="mt-3" htmlFor="bulk-text">{t('fiveSecondsGame.bulkImport.pasteText')}</Label>
                <Textarea
                  id="bulk-text"
                  placeholder={t('fiveSecondsGame.bulkImport.placeholder')}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  maxLength={5000}
                  className="min-h-75 resize-none font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  {bulkText && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBulkText('')}
                      className="h-7 text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      {t('fiveSecondsGame.bulkImport.clear')}
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('fiveSecondsGame.bulkImport.hint')}</span>
                  <span className={bulkText.length > 4500 ? 'text-amber-600 font-medium' : ''}>
                    {bulkText.length}
                    {' '}
                    / 5000
                  </span>
                </div>
              </div>

              {/* Default Settings */}
              <div className="space-y-3 border-t pt-6">
                <div>
                  <Label className="text-base">{t('fiveSecondsGame.bulkImport.defaultSettings')}</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied to questions without inline tags
                  </p>
                </div>
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

              {/* Stats */}
              {parsedQuestions.length > 0 && (
                <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-500" />
                    <span>
                      {questionsWithInlineTags}
                      {' '}
                      with inline tags
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-muted-foreground" />
                    <span>
                      {questionsWithDefaults}
                      {' '}
                      using defaults
                    </span>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* RIGHT COLUMN: PREVIEW */}
          <div className="flex flex-col h-full overflow-hidden bg-muted/20">
            <div className="p-4 border-b flex items-center justify-between bg-background/80 sticky top-0 z-10">
              <Label className="font-semibold">{t('fiveSecondsGame.bulkImport.preview')}</Label>
              {parsedQuestions.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary">
                  {parsedQuestions.length}
                </span>
              )}
            </div>

            {/* FIX: ResizableGroup is always rendered, content is conditional */}
            <ResizablePanelGroup orientation="vertical">
              {/* Top Panel (Preview) - Always Visible */}
              <ResizablePanel defaultSize={hasImported ? 50 : 100} minSize={30}>
                <ScrollArea className="flex-1 h-full">
                  {parsedQuestions.length === 0
                    ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                          <p className="text-sm">Questions will appear here...</p>
                        </div>
                      )
                    : (
                        <div className="p-4 space-y-2">
                          {parsedQuestions.map((question, index) => {
                            const difficultyColors = {
                              easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
                              medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
                              hard: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
                            };

                            return (
                              <div key={index} className="text-sm flex items-start gap-2 p-3 bg-background border hover:border-primary/40 transition-colors">
                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <div className="flex items-center justify-end">
                                    <div className="font-medium leading-relaxed">{question.text}</div>
                                    <span className="text-muted-foreground min-w-6">
                                      .
                                      {index + 1}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className={`text-xs px-2 py-0.5 ${question.hasInlineCategory
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                      : 'bg-muted text-muted-foreground'
                                    }`}
                                    >
                                      {question.categoryId || defaultCategory || t('fiveSecondsGame.bulkImport.noCategory')}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 ${question.hasInlineDifficulty
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
                        </div>
                      )}
                </ScrollArea>
              </ResizablePanel>

              {/* Bottom Panel (Imported List) - Conditional */}
              {hasImported && (
                <>
                  <ResizableHandle
                    withHandle
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => e.stopPropagation()}
                  />
                  <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="h-full border-t bg-background overflow-hidden flex flex-col">
                      <div className="p-4">
                        <CustomQuestionsList />
                      </div>
                    </div>
                  </ResizablePanel>
                </>
              )}

            </ResizablePanelGroup>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!canImport}
          >
            {buttonLabel}
            {parsedQuestions.length > 0 && bulkText.trim() && ` (${parsedQuestions.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function parseBulkText(text: string, _defaultCategory: string, defaultDifficulty: Difficulty): ParsedQuestion[] {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length >= 5);

  return lines.map((line) => {
    const inlineMatch = line.match(/^\[([^\]]+)\](.+)$/);

    if (inlineMatch) {
      const [, tags, questionText] = inlineMatch;
      const parts = tags.split('|').map(p => p.trim());

      const category = parts[0] || '';
      const difficultyInput = parts[1];

      const mappedDifficulty = difficultyInput ? normalizeDifficulty(difficultyInput) : undefined;
      const validDifficulty = mappedDifficulty || defaultDifficulty;

      return {
        text: questionText.trim(),
        categoryId: category,
        difficulty: validDifficulty,
        hasInlineCategory: !!category,
        hasInlineDifficulty: !!parts[1] && mappedDifficulty !== defaultDifficulty,
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
