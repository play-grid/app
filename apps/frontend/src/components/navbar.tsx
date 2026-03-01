import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Logo } from '@/features/landing/components/logo';
import { cn } from '@/lib/utils';

// Hamburger icon component
function HamburgerIcon({ className, ...props }: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      className={cn('pointer-events-none', className)}
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4 12L20 12"
        className="origin-center -translate-y-1.75 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
      />
      <path
        d="M4 12H20"
        className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
      />
      <path
        d="M4 12H20"
        className="origin-center translate-y-1.75 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
      />
    </svg>
  );
}

// Types
export interface NavbarNavLink {
  href: string;
  label: string;
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: NavbarNavLink[];
  signInText?: string;
  signInHref?: string;
  ctaText?: string;
  ctaHref?: string;
  onSignInClick?: () => void;
  onCtaClick?: () => void;
}

// Default navigation links
const defaultNavigationLinks: NavbarNavLink[] = [
  { href: '', label: 'home.navLinks.home' },
  { href: '/play', label: 'home.navLinks.games' },
  { href: '/about', label: 'home.navLinks.about' },
];

export function Navbar({
  ref,
  className,
  navigationLinks = defaultNavigationLinks,
  ...props
}: NavbarProps & { ref?: React.Ref<HTMLElement> }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  const location = useLocation();
  const lang = location.pathname.split('/')[1];

  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
        setIsMobile(width < 768);
      }
    };

    checkWidth();
    const resizeObserver = new ResizeObserver(checkWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const combinedRef = React.useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    }
    else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  return (
    <header
      ref={combinedRef}
      className={cn(
        'sticky top-0 z-50 w-full border-b border-primary/10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60',
        className,
      )}
      {...props}
    >
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
        {/* Left side - Logo and Nav */}
        <div className="flex items-center gap-6">
          {/* Mobile menu button */}
          {isMobile && (
            <Button
              className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
              variant="ghost"
              size="icon"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <HamburgerIcon />
            </Button>
          )}

          {/* Logo */}
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                to={`/${lang}/play`}
                end
                className="flex items-center"
              >
                <Logo />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {t('home.beta-logo-popover')}
            </TooltipContent>
          </Tooltip>

          {/* Desktop Navigation */}
          {!isMobile && (
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {navigationLinks.map((link, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <NavigationMenuItem key={index}>
                    <NavLink
                      to={`/${lang}${link.href === '/' ? '' : link.href}`}
                      end
                      className={({ isActive }) =>
                        cn(
                          'inline-flex h-9 items-center justify-center rounded-xs px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none no-underline',
                          isActive
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground/80',
                        )}
                    >
                      {t(link.label)}
                    </NavLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        {/* Right side - Action buttons */}
        {/* <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-sm font-medium"
            onClick={(e) => {
              e.preventDefault();
              if (onSignInClick)
                onSignInClick();
            }}
          >
            {signInText}
          </Button>
          <Button
            size="sm"
            className="text-sm font-medium"
            onClick={(e) => {
              e.preventDefault();
              if (onCtaClick)
                onCtaClick();
            }}
          >
            {ctaText}
          </Button>
        </div> */}
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="border-t bg-background">
          <nav className="container mx-auto px-4 py-3">
            <div className="flex flex-col gap-1">
              {navigationLinks.map((link, index) => (

                <NavLink
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  to={`/${lang}${link.href === '/' ? '' : link.href}`}
                  end
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground no-underline',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground/80',
                    )}
                >
                  {t(link.label)}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

Navbar.displayName = 'Navbar';

export { HamburgerIcon };
