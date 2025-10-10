import { DirectionProvider } from '@radix-ui/react-direction';
import { Globe, Settings, Sparkles, Sun } from 'lucide-react';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useGameNavigation } from '@/hooks/use-game-navigation';
import { cn } from '@/lib/utils';
import LanguageToggle from '../i18n/language-toggle';
import { ThemeToggle } from './theme/theme-toggle';

// Define author details to keep them in one place

function SiteCustomizations() {
  const { t, i18n } = useTranslation();
  const { changeLanguage } = useGameNavigation();
  const [pendingLanguage, setPendingLanguage] = useState(i18n.language);

  const handleSave = () => {
    // Change language via URL navigation instead of direct i18n change
    changeLanguage(pendingLanguage as any);
  };
  const isRTL = i18n.language === 'ar';
  const sheetSide = window.matchMedia('(min-width: 640px)').matches
    ? isRTL ? 'right' : 'left'
    : 'bottom';
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          name="site_customizations"
          data-testid="site-customizations-button"
          className={cn(
            'group',
            'rounded-full p-2 size-9',
            isRTL ? 'ml-auto' : 'mr-auto',
          )}
          variant="secondary"
        >
          <Settings className="w-6 h-6 text-primary transition-colors duration-300" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side={sheetSide}
        className={cn(
          'w-full sm:w-[440px] p-0 border-0',
          'bg-background/95 backdrop-blur-2xl',
          'shadow-2xl',
          isRTL ? 'rtl' : 'ltr',
        )}
      >
        <DirectionProvider dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Enhanced Header Section with Gradient */}
          <SheetHeader
            className={cn(
              'relative px-6 pt-8 pb-8 overflow-hidden',
              'bg-gradient-to-br from-primary via-primary to-primary/80',
              'text-background',
            )}
          >
            <div className="relative flex items-center gap-4">
              <div
                className={cn(
                  'p-3 rounded-2xl transition-transform duration-500 hover:rotate-12',
                  'bg-primary-foreground/20 backdrop-blur-sm border border-primary-foreground/30',
                )}
              >
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="text-left flex-1 rtl:text-right">
                <SheetTitle className="text-3xl font-serif font-thin text-background leading-tight">
                  {t('customizations.sheet_title')}
                </SheetTitle>
                <SheetDescription
                  className="text-background/80 text-sm font-normal leading-relaxed"
                >
                  {t('customizations.sheet_description')}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Enhanced Content Section */}
          <div className="flex-1 px-2 py-4 space-y-2">
            {/* Language Settings with enhanced styling */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-accent">
                  <Globe className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  {t('customizations.language_section_title')}
                </h3>
              </div>

              <div className={cn(
                'group relative overflow-hidden',
                'flex items-center justify-between p-5 rounded-2xl',
                'bg-card border-2 border-border hover:border-primary/40',
                'shadow-sm hover:shadow-lg transition-all duration-300',
                'hover:bg-accent/20',
              )}
              >
                <Label
                  htmlFor="language"
                  className={cn(
                    'font-semibold text-card-foreground text-base',
                    'text-left',
                    'rtl:text-right',
                  )}
                >
                  {t('customizations.language_label')}
                </Label>
                <div className="relative z-10">
                  <LanguageToggle
                    currentLocale={pendingLanguage}
                    onChange={lng => setPendingLanguage(lng)}
                  />
                </div>
                {/* Subtle background decoration */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* Theme Settings */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-accent">
                  <Sun className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  {t('customizations.theme_section_title')}
                </h3>
              </div>

              <div className={cn(
                'group relative overflow-hidden',
                'flex items-center justify-between p-5 rounded-2xl',
                'bg-card border-2 border-border hover:border-primary/40',
                'shadow-sm hover:shadow-lg transition-all duration-300',
                'hover:bg-accent/20',
              )}
              >
                <Label
                  htmlFor="theme"
                  className={cn(
                    'font-semibold text-card-foreground text-base',
                    'text-left',
                    isRTL && 'text-right',
                  )}
                >
                  {t('customizations.theme_label')}
                </Label>
                <div className="relative z-10">
                  <ThemeToggle />
                </div>
                {/* Subtle background decoration */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>
          {/* Enhanced Footer Section */}
          <SheetFooter className={cn(
            'relative px-6 py-6 mt-auto',
            'bg-card/80 backdrop-blur-md border-t-2 border-border/60',
          )}
          >
            <div className="flex gap-4 w-full">
              <SheetClose asChild>
                <Button
                  variant="secondary"
                  className={cn(
                    'flex-1 h-12 text-base',
                  )}
                >
                  {t('cancel_button')}
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  type="submit"
                  data-testid="save-customizations-button"
                  className={cn(
                    'flex-1 h-12 text-base font-bold rounded-2xl',
                    'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary',
                    'text-primary-foreground shadow-lg hover:shadow-xl',
                    'transition-all duration-300 hover:scale-[1.02]',
                    'border-2 border-primary/20',
                  )}
                >
                  <span className="flex items-center gap-2" onClick={handleSave}>
                    {t('customizations.save_button')}
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </span>
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </DirectionProvider>
      </SheetContent>
    </Sheet>
  );
}

export default SiteCustomizations;
