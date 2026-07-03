import type { SupportedLanguage } from '@playgrid/shared/types';
import type { LogoSetKey } from '../lib/logo-data';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchLogos } from '../services/unified-logo-service';
import { useGameStore } from '../stores/game-state-store';
import { useShuffleLogos } from './use-shuffle-logos';

vi.mock('../services/unified-logo-service', () => ({
  fetchLogos: vi.fn(),
}));

const TEST_LOGO_SET = 'companies' as LogoSetKey;
const TEST_LIST_ID = 'companies';
const TEST_LANGUAGE = 'en' as SupportedLanguage;

const mockLogos = [
  { id: 1, name: 'Apple', imageUrl: '/logos/apple.png', eliminated: false, countryData: undefined, type: undefined },
  { id: 2, name: 'Google', imageUrl: '/logos/google.png', eliminated: false, countryData: undefined, type: undefined },
  { id: 3, name: 'Microsoft', imageUrl: '/logos/microsoft.png', eliminated: false, countryData: undefined, type: undefined },
  { id: 4, name: 'Amazon', imageUrl: '/logos/amazon.png', eliminated: false, countryData: undefined, type: undefined },
  { id: 5, name: 'Meta', imageUrl: '/logos/meta.png', eliminated: false, countryData: undefined, type: undefined },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

function resetStore() {
  useGameStore.setState({
    selectedSet: TEST_LOGO_SET,
    selectedList: TEST_LIST_ID,
    selectedGrid: '8x6',
    playerA: { id: 'player-a', name: 'Player A', logos: [], winner: null, activeCount: 0 },
    playerB: { id: 'player-b', name: 'Player B', logos: [], winner: null, activeCount: 0 },
    gameStarted: false,
    gameInitialized: false,
    listIsEmpty: false,
    gridCols: 4,
  });
}

describe('useShuffleLogos', () => {
  afterEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  it('fetches logos, shuffles, and updates store', async () => {
    vi.mocked(fetchLogos).mockResolvedValue(mockLogos);

    const { result } = renderHook(
      () => useShuffleLogos(TEST_LOGO_SET, TEST_LIST_ID, TEST_LANGUAGE, 3, true),
      { wrapper: createWrapper() },
    );

    await result.current.shuffleLogos();

    expect(fetchLogos).toHaveBeenCalledOnce();
    expect(fetchLogos).toHaveBeenCalledWith(TEST_LOGO_SET, TEST_LIST_ID, TEST_LANGUAGE, 100, false);

    const state = useGameStore.getState();
    expect(state.playerA.logos).toHaveLength(3);
    expect(state.playerB.logos).toHaveLength(3);
    expect(state.gameInitialized).toBe(true);
    expect(state.gameStarted).toBe(true);
  });

  it('returns shuffled subset of logos', async () => {
    const manyLogos = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      name: `Logo ${i + 1}`,
      imageUrl: `/logos/${i + 1}.png`,
      eliminated: false,
      countryData: undefined,
      type: undefined,
    }));
    vi.mocked(fetchLogos).mockResolvedValue(manyLogos);

    const { result } = renderHook(
      () => useShuffleLogos(TEST_LOGO_SET, TEST_LIST_ID, TEST_LANGUAGE, 5, true),
      { wrapper: createWrapper() },
    );

    await result.current.shuffleLogos();

    const state = useGameStore.getState();
    expect(state.playerA.logos).toHaveLength(5);

    const names = state.playerA.logos.map(l => l.name);
    expect(new Set(names).size).toBe(5);
    expect(state.playerB.logos).toHaveLength(5);
  });

  it('does nothing when disabled', async () => {
    const { result } = renderHook(
      () => useShuffleLogos(TEST_LOGO_SET, TEST_LIST_ID, TEST_LANGUAGE, 3, false),
      { wrapper: createWrapper() },
    );

    await result.current.shuffleLogos();

    expect(fetchLogos).not.toHaveBeenCalled();

    const state = useGameStore.getState();
    expect(state.playerA.logos).toHaveLength(0);
  });

  it('throws when no logos returned', async () => {
    vi.mocked(fetchLogos).mockResolvedValue([]);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(
      () => useShuffleLogos(TEST_LOGO_SET, TEST_LIST_ID, TEST_LANGUAGE, 3, true),
      { wrapper: createWrapper() },
    );

    await expect(result.current.shuffleLogos()).rejects.toThrow('No logos available to shuffle');
  });
});
