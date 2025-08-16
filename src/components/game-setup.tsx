'use client'

import type { LogoSetKey } from '@/lib/logo-data'
import { Building2, Clock, Film, Flag, Grid3X3, Trophy, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { gridConfigurations } from '@/lib/grid-configurations'

interface GameSetupProps {
  selectedSet: LogoSetKey
  onSetChange: (set: LogoSetKey) => void
  selectedGrid: string
  onGridChange: (gridId: string) => void
  onStartGame: () => void
  canStart?: boolean // Add this
  isLoading?: boolean // Optional: show loading state
}

const logoSets = [
  {
    id: 'companies' as LogoSetKey,
    name: 'Companies',
    description: 'Famous brand logos',
    icon: Building2,
    color: 'bg-blue-500',
  },
  {
    id: 'countries' as LogoSetKey,
    name: 'Countries',
    description: 'National flags',
    icon: Flag,
    color: 'bg-green-500',
  },
  {
    id: 'movies' as LogoSetKey,
    name: 'Movies',
    description: 'Film & TV logos',
    icon: Film,
    color: 'bg-purple-500',
  },
  {
    id: 'sports' as LogoSetKey,
    name: 'Sports',
    description: 'Team & league logos',
    icon: Zap,
    color: 'bg-orange-500',
  },
]

export function GameSetup({
  selectedSet,
  onSetChange,
  selectedGrid,
  onGridChange,
  onStartGame,
  canStart = true,
  isLoading = false,
}: GameSetupProps) {
  const currentGrid = gridConfigurations.find(g => g.id === selectedGrid) || gridConfigurations[2]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 text-center">
        <div className="mb-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Logo Guessing Game</h1>
          <p className="text-muted-foreground">
            Choose a logo set and grid size, then start guessing! Players take turns asking questions and eliminating
            logos.
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-lg font-semibold mb-4">Choose Logo Set:</label>
            <div className="grid grid-cols-2 gap-4">
              {logoSets.map((set) => {
                const IconComponent = set.icon
                const isSelected = selectedSet === set.id
                return (
                  <Card
                    key={set.id}
                    className={`p-6 cursor-pointer transition-all hover:scale-105 border-2 ${
                      isSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => onSetChange(set.id)}
                  >
                    <div
                      className={`w-12 h-12 rounded-full ${set.color} flex items-center justify-center mx-auto mb-3`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{set.name}</h3>
                    <p className="text-sm text-muted-foreground">{set.description}</p>
                    {isSelected && (
                      <Badge className="mt-2" variant="default">
                        Selected
                      </Badge>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-4">Choose Grid Size:</label>
            <Select value={selectedGrid} onValueChange={onGridChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gridConfigurations.map(config => (
                  <SelectItem key={config.id} value={config.id}>
                    <div className="flex items-center gap-2">
                      <Grid3X3 className="w-4 h-4" />
                      <span>{config.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {config.difficulty}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-3 p-4 bg-muted rounded-lg text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-base">{currentGrid.name}</span>
                <Badge variant="outline">{currentGrid.difficulty}</Badge>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Grid3X3 className="w-4 h-4" />
                  <span>
                    {currentGrid.totalLogos}
                    {' '}
                    logos
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{currentGrid.estimatedTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={onStartGame}
          className="w-full mt-8"
          size="lg"
          disabled={!canStart || isLoading}
        >
          {isLoading ? 'Loading logos...' : 'Start Game'}
        </Button>
      </Card>
    </div>
  )
}
