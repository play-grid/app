import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { FooterAttribution, FooterLogoSet } from '../lib/footer-attribution';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useGameNavigation } from '@/hooks/use-game-navigation';
import { GameHeader } from '../components/game-header';
import { GameInstructions } from '../components/game-instructions';
import { GridSizeSlider } from '../components/grid-size-slider';
import { PlayerGrid } from '../components/player-grid';
import { useGameError } from '../hooks/game-room/use-game-error';
// import { useGameRoomPersistence } from '../hooks/game-room/use-game-room-persistence';
import { useGameRouteParams } from '../hooks/game-room/use-game-route-params';
import { useGameUI } from '../hooks/game-room/use-game-ui';
import { useLogoListChanger } from '../hooks/use-logo-list-changer';
import { useLogoListsQuery } from '../hooks/use-logo-lists-query';
import { footerAttribution } from '../lib/footer-attribution';
import { getGridConfiguration } from '../lib/grid-configurations';
import { useGameStore } from '../stores/game-state-store';

export default function LocalGamePlayPage() {
  const { navigate } = useGameNavigation('guess-logo');
  const { t, i18n } = useTranslation();
  const { changeLogoList } = useLogoListChanger();

  const routeParams = useGameRouteParams({ enabled: true });
  // const { loadAttempted, clearGameState } = useGameRoomPersistence({
  //   ...routeParams,
  //   enabled: true,
  // });

  const {
    playerA,
    playerB,
    currentPlayer,
    resetGame,
    // startNewGame,
    togglePlayerALogo,
    togglePlayerBLogo,
    switchTurn,
    selectedList,
    // updateLogosForList,
    isUpdatingLogos,
    shuffleLogos,
    error: storeError,
    clearError,
    listIsEmpty,
  } = useGameStore();

  const gameError = useGameError({
    fetchError: storeError ? new Error(storeError) : null,
    isValidRoute: routeParams.isValidRoute,
  });

  const { data: availableLists } = useLogoListsQuery(routeParams.logoSet, true);

  const gridConfig = getGridConfiguration(routeParams.gridSize);

  // useEffect(() => {
  //   if (loadAttempted) {
  //     updateLogosForList(
  //       routeParams.listId,
  //       routeParams.logoSet,
  //       i18n.language as any,
  //       gridConfig.totalLogos,
  //     );
  //   }
  // }, [
  //   loadAttempted,
  //   routeParams.listId,
  //   routeParams.logoSet,
  //   i18n.language,
  //   updateLogosForList,
  //   gridConfig.totalLogos,
  // ]);

  // --- UI Logic --- //
  const { showLoading, loadingMessage, showError, errorMessage } = useGameUI({
    mode: 'local',
    isLocalLoading: isUpdatingLogos,
    localError: gameError.hasError ? new Error(gameError.error || '') : null,
  });

  const handleResetGame = () => {
    // clearGameState();
    resetGame();
    clearError();
    navigate('/');
  };

  // const handleStartNewGame = () => {
  //   clearGameState();
  //   navigate(
  //     `/game/${routeParams.logoSet}/${routeParams.listId}/${routeParams.gridSize}/${encodeURIComponent(routeParams.playerAName)}/${encodeURIComponent(routeParams.playerBName)}`,
  //     { replace: true },
  //   );
  //   startNewGame();
  // };

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
  const logoSetKey = routeParams.logoSet as string;

  let footerData: FooterAttribution | null = null;
  if (logoSetKey in footerAttribution) {
    footerData = footerAttribution[logoSetKey as FooterLogoSet];
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1800px] mx-auto px-4 py-6 space-y-8">
        {/* Game Header */}

        <GameHeader
          selectedSet={routeParams.logoSet}
          currentPlayer={currentPlayer}
          playerA={playerA}
          playerB={playerB}
          gridConfig={gridConfig}
          availableLists={availableLists || []}
          selectedList={selectedList}
          onListChange={changeLogoList}
          onSwitchTurn={switchTurn}
          onResetGame={handleResetGame}
          // onStartNewGame={handleStartNewGame}
          onShuffle={() => { shuffleLogos(i18n.language as SupportedLanguage); }}
        />

        {/* Grid Size Control */}
        <div className="max-w-sm mx-auto bg-card rounded-2xl shadow-sm border border-border p-6">
          <GridSizeSlider />
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
