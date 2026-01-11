import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ComboboxProps {
  options: { label: string; value: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  allowCreate?: boolean;
  onCreate?: (value: string) => void;
  createLabel?: (value: string) => string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found.',
  allowCreate = false,
  onCreate,
  createLabel = value => `Create "${value}"`,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (!searchValue)
      return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()),
    );
  }, [options, searchValue]);

  const exactMatch = options.some(opt => opt.label.toLowerCase() === searchValue.toLowerCase());
  const showCreateOption = allowCreate && searchValue.trim() && !exactMatch;

  const handleCreate = () => {
    const trimmedValue = searchValue.trim();
    if (onCreate && trimmedValue) {
      onCreate(trimmedValue);
      onChange(trimmedValue);
      setOpen(false);
      setSearchValue('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? options.find(option => option.value === value)?.label || value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && showCreateOption) {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                    setSearchValue('');
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
              {showCreateOption && (
                <CommandItem
                  value={searchValue}
                  onSelect={handleCreate}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createLabel(searchValue)}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
