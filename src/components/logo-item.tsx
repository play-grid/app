'use client'

import type { LogoItem } from '@/lib/logo-data'
import { Trophy, X } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface LogoItemProps {
  logo: LogoItem
  isWinner: boolean
  onToggle: () => void
}

export function LogoItemComponent({ logo, isWinner, onToggle }: LogoItemProps) {
  return (
    <Card
      className={`aspect-square p-2 cursor-pointer transition-all hover:shadow-md ${
        logo.eliminated ? 'bg-destructive/10 border-destructive/20' : 'hover:shadow-lg hover:-translate-y-0.5'
      } ${isWinner ? 'animate-bounce bg-green-100 border-green-400 border-2 shadow-lg' : ''}`}
      onClick={onToggle}
    >
      <div className="h-full flex items-center justify-center relative">
        <span
          className={`text-xs text-center font-medium leading-tight ${
            logo.eliminated ? 'text-destructive line-through' : 'text-card-foreground'
          } ${isWinner ? 'text-green-700 font-bold' : ''}`}
        >
          {logo.name}
        </span>
        {logo.eliminated && <X className="absolute top-0 right-0 w-4 h-4 text-destructive" />}
        {isWinner && <Trophy className="absolute top-0 left-0 w-4 h-4 text-green-600 animate-pulse" />}
      </div>
    </Card>
  )
}
