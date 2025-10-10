import { DirectionProvider } from '@radix-ui/react-direction';
import { Globe, Info, Settings, Sparkles, Sun, User } from 'lucide-react';
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
const AUTHOR_X_HANDLE = '_mohdalaa';

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
                    isRTL && 'text-right',
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

            <Separator className="bg-border/60" />

            {/* Enhanced App Info Section */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-secondary">
                  <Info className="w-5 h-5 text-secondary-foreground" />
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  {t('customizations.app_info_title')}
                </h3>
              </div>

              <div className={cn(
                'group relative p-6 rounded-2xl space-y-4',
                'bg-gradient-to-br from-card to-accent/10',
                'border-2 border-border hover:border-accent/50',
                'shadow-sm hover:shadow-xl transition-all duration-500',
                'hover:scale-[1.01]',
              )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-semibold text-foreground/90 flex items-center gap-1">
                    {t('customizations.developer_label')}
                  </span>
                </div>

                <div className={cn('text-left space-y-3', isRTL && 'text-right')}>
                  <p className="text-base font-bold text-foreground">
                    {t('customizations.author_name')}
                  </p>
                  <a
                    href={`https://x.com/${AUTHOR_X_HANDLE}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'inline-flex items-center gap-2 text-sm px-4 py-2',
                      'bg-primary/10 hover:bg-primary/20 text-primary font-medium',
                      'rounded-xl transition-all duration-300 hover:scale-105',
                      'hover:shadow-lg border border-primary/20 hover:border-primary/40',
                    )}
                  >
                    <span>{t('customizations.follow_on_x', { handle: AUTHOR_X_HANDLE })}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Enhanced Fun Facts Section */}
            <div className={cn(
              'group relative p-5 rounded-2xl space-y-3 overflow-hidden',
              'bg-gradient-to-r from-destructive/5 via-destructive/10 to-destructive/5',
              'border-2 border-destructive/20 hover:border-destructive/40',
              'shadow-sm hover:shadow-lg transition-all duration-300',
            )}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-destructive/20">
                    <Sparkles className="w-5 h-5 text-destructive " />
                  </div>
                  <span className="text-base font-bold text-destructive">
                    {t('customizations.fun_fact_title')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {t('customizations.fun_fact_content')}
                </p>
              </div>
              {/* Animated background decoration */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-destructive/10 group-hover:scale-150 transition-transform duration-700" />
            </div>

            {/* Enhanced Version Info */}
            <div className={cn(
              'relative p-4 rounded-2xl text-center overflow-hidden',
              'bg-gradient-to-r from-muted via-accent/20 to-muted',
              'border border-border/60',
            )}
            >
              <div className="relative z-10">
                <p className="text-sm font-bold text-muted-foreground flex items-center justify-center gap-2">
                  {t('customizations.version_info')}
                  <span className="">🚀</span>
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
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
                  {t('customizations.cancel_button')}
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  type="submit"
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
