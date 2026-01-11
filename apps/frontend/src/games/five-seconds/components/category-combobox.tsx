import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomQuestionsStore } from '../stores/custom-questions-store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface CategoryComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  categories?: string[];
}

export function CategoryCombobox({ value, onChange, placeholder, categories }: CategoryComboboxProps) {
  const { customCategories: defaultCategories, addCustomCategory } = useCustomQuestionsStore();
  const displayCategories = categories || defaultCategories;
  const [isCreating, setIsCreating] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const { t } = useTranslation();
  const defaultPlaceholder = t('fiveSecondsGame.categoryCombobox.selectCategory');
  const finalPlaceholder = placeholder || defaultPlaceholder;

  const handleCreate = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !displayCategories.includes(trimmed)) {
      if (categories) {
        // If categories prop provided, just select it (no add to store)
        onChange(trimmed);
        setNewCategory('');
        setIsCreating(false);
      }
      else {
        // Default behavior: add to custom categories
        addCustomCategory(trimmed);
        onChange(trimmed);
        setNewCategory('');
        setIsCreating(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
    else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewCategory('');
    }
  };

  if (isCreating) {
    return (
      <div className="flex flex-col gap-2">
        <Input
          autoFocus
          placeholder={t('fiveSecondsGame.categoryCombobox.enterCategoryName')}
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <div className="flex gap-4">

          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newCategory.trim()}
          >
            {t('common.create')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsCreating(false);
              setNewCategory('');
            }}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="flex-1 h-8">
          <SelectValue placeholder={finalPlaceholder} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {displayCategories.length === 0
            ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {t('fiveSecondsGame.categoryCombobox.noCategoriesYet')}
                </div>
              )
            : (
                displayCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))
              )}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsCreating(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
