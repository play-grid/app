import type { LogoSetKey } from '@/lib/logo-data'
import type { Player } from '@/types'
import { Building2, Clock, Film, Flag, Grid3X3, Trophy, Users, Zap } from 'lucide-react'
import React, { useState } from 'react'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { gridConfigurations } from '@/lib/grid-configurations'

interface GameSetupProps {
  selectedSet: LogoSetKey
  onSetChange: (set: LogoSetKey) => void
  selectedGrid: string
  onGridChange: (gridId: string) => void
  playerA: Player
  playerB: Player
  onPlayerANameChange: (name: string) => void
  onPlayerBNameChange: (name: string) => void
  onStartGame: () => void
  canStart: boolean
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

const playerNameSchema = z.string().trim().min(2, 'Name must be at least 2 characters').max(20, 'Name must be at most 20 characters')

export function GameSetup({
  selectedSet,
  onSetChange,
  selectedGrid,
  onGridChange,
  playerA,
  playerB,
  onPlayerANameChange,
  onPlayerBNameChange,
  onStartGame,
  canStart,
}: GameSetupProps) {
  const [attemptedStart, setAttemptedStart] = useState(false)
  const currentGrid = gridConfigurations.find(g => g.id === selectedGrid) || gridConfigurations[2]

  // Zod validation for player names
  const playerAValidation = playerNameSchema.safeParse(playerA.name)
  const playerBValidation = playerNameSchema.safeParse(playerB.name)

  const playerAError = !playerAValidation.success ? playerAValidation.error.issues[0].message : ''
  const playerBError = !playerBValidation.success ? playerBValidation.error.issues[0].message : ''

  const canStartGame
    = playerAValidation.success
      && playerBValidation.success
      && canStart

  function handleStartGame() {
    setAttemptedStart(true)
    if (canStartGame) {
      onStartGame()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 text-center">
        <div className="mb-8">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Logo Guessing Game</h1>
          <p className="text-muted-foreground">
            Choose a logo set and grid size, enter player names, then start guessing! Players take turns asking
            questions and eliminating logos.
          </p>
        </div>

        <div className="space-y-8">
          {/* Player Names Section */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <label className="text-lg font-semibold">Player Names:</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="player-a" className="text-sm font-medium text-blue-600">
                  First Player
                </Label>
                <Input
                  id="player-a"
                  type="text"
                  placeholder="Enter first player name"
                  value={playerA.name}
                  onChange={e => onPlayerANameChange(e.target.value)}
                  className={`text-center border-blue-200 focus:border-blue-500 ${attemptedStart && playerAError ? 'border-red-500' : ''}`}
                  maxLength={20}
                />
                {attemptedStart && playerAError && (
                  <p className="text-xs text-red-500">{playerAError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="player-b" className="text-sm font-medium text-green-600">
                  Second Player
                </Label>
                <Input
                  id="player-b"
                  type="text"
                  placeholder="Enter second player name"
                  value={playerB.name}
                  onChange={e => onPlayerBNameChange(e.target.value)}
                  className={`text-center border-green-200 focus:border-green-500 ${attemptedStart && playerBError ? 'border-red-500' : ''}`}
                  maxLength={20}
                />
                {attemptedStart && playerBError && (
                  <p className="text-xs text-red-500">{playerBError}</p>
                )}
              </div>
            </div>
            {attemptedStart && (!playerAValidation.success || !playerBValidation.success) && (
              <p className="text-sm text-muted-foreground mt-2">Both player names are required and must be valid to start the game</p>
            )}
          </div>

          {/* Logo Set Selection */}
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
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Grid Size Selection */}
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

        <Button onClick={handleStartGame} className="w-full mt-8" size="lg">
          Start Game
        </Button>
        {attemptedStart && (!playerAValidation.success || !playerBValidation.success) && (
          <p className="text-sm text-red-500 mt-2">Enter valid player names to continue.</p>
        )}
      </Card>
    </div>
  )
}
