'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

function SelectTrigger({ ref, className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Trigger> | null> }) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-12 w-full items-center justify-between rounded-xl border-2 border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 group',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-5 w-5 text-gray-500 transition-all duration-300 group-hover:text-cyan-600 group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

function SelectScrollUpButton({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.ScrollUpButton> | null> }) {
  return (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn('flex cursor-default items-center justify-center py-2 hover:bg-cyan-50 transition-colors', className)}
      {...props}
    >
      <ChevronUp className="h-4 w-4 text-cyan-600" />
    </SelectPrimitive.ScrollUpButton>
  )
}
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

function SelectScrollDownButton({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.ScrollDownButton> | null> }) {
  return (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn('flex cursor-default items-center justify-center py-2 hover:bg-cyan-50 transition-colors', className)}
      {...props}
    >
      <ChevronDown className="h-4 w-4 text-cyan-600" />
    </SelectPrimitive.ScrollDownButton>
  )
}
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

function SelectContent({ ref, className, children, position = 'popper', ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Content> | null> }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border-2 border-gray-200 bg-white/95 backdrop-blur-md text-gray-800 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          position === 'popper'
          && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            'p-2',
            position === 'popper'
            && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}
SelectContent.displayName = SelectPrimitive.Content.displayName

function SelectLabel({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Label> | null> }) {
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn('py-2 pl-10 pr-3 text-sm font-bold text-gray-600', className)}
      {...props}
    />
  )
}
SelectLabel.displayName = SelectPrimitive.Label.displayName

function SelectItem({ ref, className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Item> | null> }) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-lg py-3 pl-10 pr-3 text-sm font-medium outline-none transition-all duration-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-purple-50 hover:text-cyan-700 focus:bg-gradient-to-r focus:from-cyan-100 focus:to-purple-100 focus:text-cyan-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 mx-1',
        className,
      )}
      {...props}
    >
      <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-cyan-600" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}
SelectItem.displayName = SelectPrimitive.Item.displayName

function SelectSeparator({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> & { ref?: React.RefObject<React.ElementRef<typeof SelectPrimitive.Separator> | null> }) {
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-2 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent', className)}
      {...props}
    />
  )
}
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
