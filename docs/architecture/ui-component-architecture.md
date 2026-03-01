# UI Component Architecture: Primitives + Game-Specific Skins

**Version:** 1.0 (Temporary)
**Date:** Feb 21, 2026
**Status:** Current Implementation (Future: Design Tokens System)

## Summary

PlayGrid uses a two-layer UI component architecture that enables pluggable games with unique visual identities while maintaining consistency across the platform. This temporary solution separates **primitive components** (base functionality) from **game-specific skins** (styling and variants), allowing each game to have its own theme without duplicating component logic.

**Future:** This architecture will evolve into a design token-based system where games can customize visual properties (colors, spacing, typography) without needing to create separate component files.

---

## Two-Layer Architecture

### Layer 1: Primitive Components (`packages/ui/src/`)

**Purpose:** Provide unstyled, accessible, reusable building blocks

**Characteristics:**
- Minimal styling (reset + structural layout only)
- Base functionality and accessibility features
- Use Radix UI for headless behavior where applicable
- Export semantic `data-slot` attributes for styling hooks
- **No variants** (no CVA) - pure primitives
- Designed to be extended, not used directly

**Examples:**
- `Button` - Base button with reset styles, `asChild` support
- `Input` - Input with base layout and file input reset
- `Card` - Container with header, content, footer sub-components
- `Dialog`, `Select`, `Tooltip` - Radix-based headless components

**Example (Button Primitive):**
```typescript
// packages/ui/src/button.tsx
function Button({ className, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn('inline-flex items-center justify-center...', className)}
      {...props}
    />
  );
}
```

### Layer 2: Game-Specific Skins (`apps/frontend/src/games/[game-name]/components/ui/`)

**Purpose:** Apply visual identity and variants specific to each game

**Characteristics:**
- Import and extend primitives from `packages/ui`
- Add CVA variants for different visual states (default, secondary, destructive, etc.)
- May include game-specific CSS files for complex styles
- Use semantic class names (e.g., `pixel__button`, `pixel-font`)
- Leverage `ExtractVariants` utility for type-safe variant props
- Add game-specific inline styles when needed (e.g., `imageRendering: 'pixelated'`)

**Examples:**
- Five Seconds game: Pixel-art aesthetic, bold colors, custom CSS
- Future games: Clean minimal style, retro aesthetic, etc.

**Example (Five Seconds Button Skin):**
```typescript
// apps/frontend/src/games/five-seconds/components/ui/button.tsx
import { Button as PrimitiveButton } from '@playgrid/ui/button';
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'pixel__button pixel-font cursor-pointer...',
  {
    variants: {
      variant: {
        default: 'pixel-default__button box-shadow-margin...',
        secondary: 'pixel-secondary__button...',
        warning: 'pixel-warning__button...',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8 text-base',
      },
    },
  },
);

export function Button({ className, variant, size, ...props }) {
  return (
    <PrimitiveButton
      asChild={asChild}
      className={cn(buttonVariants({ variant, size }), className)}
      style={{ imageRendering: 'pixelated' }}
      {...props}
    />
  );
}
```

---

## Benefits

### For the Platform
- **Consistency:** All games use the same underlying primitives
- **Maintainability:** Fixes to primitives automatically benefit all games
- **Separation of Concerns:** Functionality vs. presentation clearly separated
- **Pluggable Games:** New games can be added with unique visual identities

### for Game Developers
- **Complete Control:** Each game can define its own aesthetic
- **No Coupling:** Games don't share visual styles
- **Type Safety:** Variant props are fully typed via CVA and `ExtractVariants`
- **Extensibility:** Add new variants or styles without touching primitives

---

## Component Lifecycle

### Creating a New Primitive

1. Create base component in `packages/ui/src/[component].tsx`
2. Add minimal, game-agnostic styles (layout, reset, accessibility)
3. Add `data-slot` attribute for styling hooks
4. Export from `packages/ui/package.json` for easy importing
5. **Do not:** Add variants, game-specific styling, or CVA

### Creating a New Game Skin at `@playgrid/frontend/src/games[game]`

1. Import primitive from `@playgrid/ui/[component]`
2. Define CVA variants for visual states
3. Apply game-specific classes (fonts, colors, effects)
4. Optionally add game-specific CSS file
5. Use `ExtractVariants` for type-safe variant props
6. Export from game-specific UI directory

**Example (Input):**
```typescript
// packages/ui/src/input.tsx
function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full px-3 py-2 text-sm', // Base layout
        'text-left rtl:text-right', // Directionality
        'bg-transparent outline-none appearance-none', // Reset
        className,
      )}
      {...props}
    />
  );
}

// apps/frontend/src/games/[game]/components/ui/input.tsx
import { Input as PrimitiveInput } from '@playgrid/ui/input';

export function Input({ className, ...props }) {
  return (
    <PrimitiveInput
      className={cn(
        'bg-popover text-foreground', // game colors
        'border-none shadow-md focus:translate-y-px', // game shadow
        'pixel-font-sm', // game font
        className,
      )}
      {...props}
    />
  );
}
```

---

## File Structure

```
packages/ui/src/
├── button.tsx              # Primitive button
├── input.tsx               # Primitive input
├── card.tsx                # Primitive card (+ sub-components)
├── dialog.tsx              # Primitive dialog (Radix-based)
├── ...
└── index.ts                # Main exports

apps/frontend/src/games/
├── five-seconds/
│   └── components/ui/
│       ├── button.tsx      # Five Seconds button skin
│       ├── button.css      # Five Seconds button styles
│       ├── input.tsx       # Five Seconds input skin
│       ├── card.tsx        # Five Seconds card skin
│       └── ...
├── guess-logo/
│   └── components/ui/
│       ├── button.tsx      # Guess Logo button skin
│       └── ...
└── another-game/
    └── components/ui/
        └── ...
```

---

## Type Safety

### ExtractVariants Utility

The `ExtractVariants` type extracts variant prop types from CVA definitions:

```typescript
// packages/ui/src/utils/types.ts
import type { VariantProps } from 'class-variance-authority';

export type ExtractVariants<T extends (...args: any[]) => any> = VariantProps<T>;
```

### Usage in Game Skins

```typescript
import type { ExtractVariants } from '@playgrid/ui/utils';

const buttonVariants = cva('...', {
  variants: {
    variant: {
      default: '...',
      secondary: '...',
    },
    size: {
      default: '...',
      sm: '...',
    },
  },
});

export interface ButtonProps
  extends React.ComponentProps<typeof PrimitiveButton>,
    ExtractVariants<typeof buttonVariants> {}
// Props are now typed as: variant?: 'default' | 'secondary', size?: 'default' | 'sm'
```

---

## Current Limitations (Known)

1. **Code Duplication:** Each game must re-create skin files even if styles are similar
2. **No Theme Sharing:** Games cannot share partial styles (e.g., two games with similar buttons)
3. **CSS Scoping:** Game-specific CSS must be scoped carefully to avoid conflicts
4. **Maintenance Burden:** Adding a new primitive requires updating all game skins
5. **No Design Tokens:** Visual properties (colors, spacing) are hardcoded in class names

---

## Future Direction: Design Tokens System

**Status:** Planned for future implementation

### What Will Change

Instead of creating separate component files for each game, games will define **design tokens** that control visual properties:

```typescript
// apps/frontend/src/games/five-seconds/theme/tokens.ts
export const fiveSecondsTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    destructive: '#ef4444',
    // ...
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    // ...
  },
  typography: {
    fontFamily: 'Press Start 2P, monospace',
    sizes: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
    },
  },
  effects: {
    shadow: '4px 4px 0px rgba(0, 0, 0, 1)',
    borderRadius: '0px',
  },
  // ...
};
```

### Benefits of Design Tokens

- **Single Source of Truth:** All visual properties defined in one place
- **Easier Theming:** Change entire game theme by updating tokens
- **Code Reuse:** Games can inherit from base tokens
- **Runtime Theming:** Support for light/dark mode without component changes
- **Design System Alignment:** Easier to maintain consistency

### Migration Path

1. **Phase 1:** Add design token types and utilities to `packages/ui`
2. **Phase 2:** Create theme provider component for frontend
3. **Phase 3:** Migrate existing game skins to use tokens
4. **Phase 4:** Deprecate component skin files (keep for backward compatibility)
5. **Phase 5:** Enable runtime theme switching

---

## Examples from Codebase

### Button: Primitive vs Skin

**Primitive (packages/ui/src/button.tsx:11-28):**
```typescript
function Button({ className, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      data-slot="button"
      className={cn('inline-flex items-center justify-center gap-2...', className)}
      {...props}
    />
  );
}
```

**Five Seconds Skin (apps/frontend/src/games/five-seconds/components/ui/button.tsx:8-33):**
```typescript
const buttonVariants = cva(
  'pixel__button pixel-font cursor-pointer rounded-none...',
  {
    variants: {
      variant: {
        default: 'pixel-default__button box-shadow-margin bg-primary...',
        secondary: 'pixel-secondary__button box-shadow-margin',
        warning: 'pixel-warning__button box-shadow-margin',
        success: 'pixel-success__button box-shadow-margin',
        destructive: 'pixel-destructive__button box-shadow-margin',
        // ...
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8 text-base',
      },
    },
  },
);
```

**Five Seconds CSS (apps/frontend/src/games/five-seconds/components/ui/button.css:1-32):**
```css
.pixel__button {
  position: relative;
  box-shadow: var(--shadow-md);
  /* ... */
}

.pixel-default__button {
  &::after {
    border-right: 2px solid color-mix(in hsl, var(--foreground) 70%, rgba(0, 0, 0));
    border-bottom: 2px solid color-mix(in hsl, var(--foreground) 70%, rgba(0, 0, 0));
    /* ... */
  }
}
```

### Card: Multi-Component Primitive

**Primitive (packages/ui/src/card.tsx:4-91):**
```typescript
function Card({ className, ...props }) {
  return <div data-slot="card" className={cn('flex flex-col gap-6 py-6', className)} {...props} />;
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn('@container/card-header rtl:text-right grid...', className)}
      {...props}
  />
  );
}

function CardTitle({ className, ...props }) {
  return <div data-slot="card-title" className={cn('leading-none', className)} {...props} />;
}

// ... CardContent, CardFooter, etc.
```

**Five Seconds Skin (apps/frontend/src/games/five-seconds/components/ui/card.tsx:35-60):**
```typescript
function Card({ className, variant, ...props }) {
  return (
    <PrimitiveCard
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <PrimitiveCardHeader
      className={cn('border-b-2 border-border/5 mb-2', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <PrimitiveCardTitle
      className={cn('pixel-font text-lg font-bold uppercase tracking-tight', className)}
      {...props}
    />
  );
}
```

---

## Related Documentation

- [System Context](../SYSTEM_CONTEXT.md) - Platform architecture overview
- [Architecture Overview v2](./monorepo-structure-v2.md) - Monorepo structure
- [Constraint: game-core Must Be Agnostic](../CONSTRAINTS/game-core-agnostic.md) - Game-agnostic principles
- [Quick Reference](./quick-reference.md) - Developer patterns

---

## Glossary

- **Primitive:** Base component in `packages/ui` with minimal styling, no variants
- **Skin:** Game-specific component that wraps a primitive and adds styling/variants
- **CVA:** Class Variance Authority library for managing component variants
- **Design Token:** Named value that represents a visual property (future)
- **Radix UI:** Headless UI library for accessible components
- **data-slot:** Semantic attribute added to primitives for styling hooks
- **ExtractVariants:** Type utility that extracts variant props from CVA definitions

---

**Last Updated:** Feb 21, 2026
