import { useLogoQuery } from '@/hooks/use-logo-query';
import { getGridConfiguration } from '@/lib/grid-configurations';
import { logoSets } from '@/lib/logo-data';
import { useGameStore } from '@/stores/game-state-store';
import { GameHeader } from './game-header';
import { GameInstructions } from './game-instructions';
import { GameSetup } from './game-setup';
import { PlayerGrid } from './player-grid';

export function LogoGuessingGame() {
  // All state is now managed by Zustand stores
  const {
    selectedSet,
    selectedGrid,
    gameStarted,
    currentPlayer,
    playerA,
    playerB,
    setSelectedSet,
    setSelectedGrid,
    setPlayerAName,
    setPlayerBName,
    initializeGame,
    resetGame,
    togglePlayerALogo,
    togglePlayerBLogo,
    switchTurn,
  } = useGameStore();

  const gridConfig = getGridConfiguration(selectedGrid);
  const logoNames = logoSets[selectedSet].slice(0, gridConfig.totalLogos);
  const { data: fetchedLogos } = useLogoQuery(logoNames, selectedSet, !gameStarted);

  const handleStartGame = () => {
    if (fetchedLogos) {
      // Convert fetched logos to LogoItem format
      const initialLogos = fetchedLogos.map((fetchedLogo, index) => ({
        id: index + 1,
        name: fetchedLogo.name || 'Unknown Logo',
        imageUrl: fetchedLogo.imageUrl,
        eliminated: false,
      }));
      initializeGame(initialLogos);
    }
  };

  if (!gameStarted) {
    return (
      <GameSetup
        selectedSet={selectedSet}
        onSetChange={setSelectedSet}
        selectedGrid={selectedGrid}
        onGridChange={setSelectedGrid}
        playerA={playerA}
        playerB={playerB}
        onPlayerANameChange={setPlayerAName}
        onPlayerBNameChange={setPlayerBName}
        canStart={!!fetchedLogos}
        onStartGame={handleStartGame}
      />
    );
  }

  return (
    <div className="min-h-screen p-4">
      <GameHeader
        selectedSet={selectedSet}
        currentPlayer={currentPlayer}
        playerA={playerA}
        playerB={playerB}
        gridConfig={gridConfig}
        onSwitchTurn={switchTurn}
        onResetGame={resetGame}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <PlayerGrid player={playerA} onToggleLogo={togglePlayerALogo} gridConfig={gridConfig} />
        <PlayerGrid player={playerB} onToggleLogo={togglePlayerBLogo} gridConfig={gridConfig} />
      </div>

      <GameInstructions />
    </div>
  );
}
