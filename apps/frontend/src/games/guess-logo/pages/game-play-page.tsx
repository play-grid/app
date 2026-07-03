import type { SupportedLanguage } from '@playgrid/shared/types';
import type { FooterAttribution, FooterLogoSet } from '../lib/footer-attribution';
import type { LogoSetKey } from '../lib/logo-data';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAnalytics } from '@/hooks/use-analytics';
import { useGameNavigation } from '@/hooks/use-game-navigation';
import { GameHeader } from '../components/game-header';
import { GameInstructions } from '../components/game-instructions';
import { GridSizeSlider } from '../components/grid-size-slider';
import { PlayerGrid } from '../components/player-grid';
import { useGameError } from '../hooks/use-game-error';
import { useGameInitializer } from '../hooks/use-game-initializer';
import { useGameRoomPersistence } from '../hooks/use-game-room-persistence';
import { useGameRouteParams } from '../hooks/use-game-route-params';
import { useGameUI } from '../hooks/use-game-ui';
import { useLogoListChanger } from '../hooks/use-logo-list-changer';
import { useLogoListsQuery } from '../hooks/use-logo-lists-query';
import { useShuffleLogos } from '../hooks/use-shuffle-logos';
import { footerAttribution } from '../lib/footer-attribution';
import { getGridConfiguration } from '../lib/grid-configurations';
import { useGameStore } from '../stores/game-state-store';

export default function GamePlayPage() {
  const { navigate } = useGameNavigation('guess-logo');
  const { t, i18n } = useTranslation();
  const { changeLogoList } = useLogoListChanger();
  const { trackGridSizeChange, trackListChange, trackGameReset, trackGameComplete } = useAnalytics();

  const routeParams = useGameRouteParams({ enabled: true });
  const { loadAttempted, clearGameState } = useGameRoomPersistence({
    ...routeParams,
    enabled: true,
  });

  const { isLoading, error } = useGameInitializer({
    logoSet: routeParams.logoSet || 'companies',
    gridSize: routeParams.gridSize || '8x6',
    loadAttempted,
    enabled: true,
  });

  const {
    resetGame,
    playerA,
    playerB,
    listIsEmpty,
    togglePlayerALogo,
    togglePlayerBLogo,
    selectedList,
    selectedGrid,
  } = useGameStore();

  const logoSet = routeParams.logoSet || 'companies';
  const gridSize = routeParams.gridSize || '8x6';

  const gridConfig = getGridConfiguration(gridSize);
  // Logo lists query for available lists
  const { data: availableLists } = useLogoListsQuery(logoSet as LogoSetKey);

  const { shuffleLogos: shuffleLogosHook } = useShuffleLogos(
    logoSet,
    selectedList,
    i18n.language as SupportedLanguage,
    gridConfig.totalLogos,
    true,
  );

  const handleResetGame = () => {
    trackGameReset({
      game_id: 'guess-logo',
      reason: 'manual_reset',
      current_phase: 'playing',
    });
    clearGameState();
    resetGame();
    navigate('/');
  };

  const handleListChange = (newList: string) => {
    trackListChange({
      game_id: 'guess-logo',
      from_list: selectedList,
      to_list: newList,
    });
    changeLogoList(newList);
  };

  const setGridCols = useGameStore(state => state.setGridCols);
  const handleGridSizeChange = (newSize: number) => {
    trackGridSizeChange({
      game_id: 'guess-logo',
      from_size: `${selectedGrid}`,
      to_size: `${newSize}x6`,
    });
    setGridCols(newSize);
  };

  const hasTrackedWinnerRef = useRef(false);

  // Track game completion when a winner is found
  useEffect(() => {
    const winner = playerA.winner || playerB.winner;
    const winningPlayer = playerA.winner ? playerA : playerB.winner ? playerB : null;

    if (winner && winningPlayer && !hasTrackedWinnerRef.current) {
      hasTrackedWinnerRef.current = true;
      trackGameComplete({
        game_id: 'guess-logo',
        winner_id: winningPlayer.id,
        final_scores: [
          { id: playerA.id, name: playerA.name, score: playerA.logos.length },
          { id: playerB.id, name: playerB.name, score: playerB.logos.length },
        ],
        total_players: 2,
      });
    }
  }, [playerA.winner, playerB.winner, playerA, playerB, trackGameComplete]);

  const gameError = useGameError({
    fetchError: error,
    isValidRoute: routeParams.isValidRoute,
  });

  const { showLoading, loadingMessage, showError, errorMessage } = useGameUI({
    isLocalLoading: isLoading,
    error: gameError.hasError ? new Error(gameError.error || '') : null,
  });

  if (showLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <Spinner className="size-16 mb-4 text-primary" />
        <p className="text-xl font-semibold text-foreground animate-pulse">{loadingMessage}</p>
      </div>
    );
  }

  if (showError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-card-foreground mb-2">{t('error')}</h2>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          <Button
            onClick={handleResetGame}
            className="w-full"
          >
            {t('back-to-setup')}
          </Button>
        </div>
      </div>
    );
  }

  const logoSetKey = logoSet;

  let footerData: FooterAttribution | null = null;
  if (logoSetKey in footerAttribution) {
    footerData = footerAttribution[logoSetKey as FooterLogoSet];
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-450 mx-auto px-4 py-6 space-y-8">
        {/* Game Header */}
        <GameHeader
          selectedSet={logoSet as LogoSetKey}
          playerA={playerA}
          playerB={playerB}
          gridConfig={gridConfig}
          availableLists={availableLists || []}
          selectedList={selectedList}
          onListChange={handleListChange}
          onResetGame={handleResetGame}
          onShuffle={shuffleLogosHook}
        />

        {/* Grid Size Control */}
        <div className="max-w-sm mx-auto bg-card rounded-2xl shadow-sm border border-border p-6">
          <GridSizeSlider onSizeChange={handleGridSizeChange} />
        </div>

        {listIsEmpty
          ? (
              <div className="text-center p-8 bg-card rounded-2xl shadow-lg border border-border">
                <h3 className="text-2xl font-semibold text-card-foreground mb-2">{t('list-is-empty')}</h3>
                <p className="text-muted-foreground">{t('please-select-another-list')}</p>
              </div>
            )
          : (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-card rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow duration-300">
                  <PlayerGrid player={playerA} onToggleLogo={togglePlayerALogo} />
                </div>

                <div className="bg-card rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow duration-300">
                  <PlayerGrid player={playerB} onToggleLogo={togglePlayerBLogo} />
                </div>
              </div>
            )}

        {footerData && (
          <div className="text-center">
            <a
              href={footerData.href}
              title={footerData.title}
              className="inline-flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-sm border border-border text-sm text-muted-foreground hover:text-card-foreground hover:border-primary/30 transition-all duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={footerData.imgSrc} alt={footerData.imgAlt} className="w-5 h-5" />
              {footerData.text}
            </a>
          </div>
        )}

        <GameInstructions />
      </div>
    </div>
  );
}
