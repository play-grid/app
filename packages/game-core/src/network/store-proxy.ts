import type { NetworkClient } from './client';

export type GameMode = 'offline' | 'online';

export interface GameProxyConfig<TStore = any> {
  mode: GameMode;
  localStore: TStore;
  networkClient?: NetworkClient;
}

/**
 * Generic Game Proxy - Routes actions to either local store (offline) or server (online)
 * This is game-agnostic and can be used with any game implementation
 */
export class GameProxy<TStore = any> {
  private mode: GameMode;
  private localStore: TStore;
  private networkClient?: NetworkClient;

  constructor(config: GameProxyConfig<TStore>) {
    this.mode = config.mode;
    this.localStore = config.localStore;
    this.networkClient = config.networkClient;
  }

  setMode(mode: GameMode) {
    this.mode = mode;
    console.log(`Game mode switched to: ${mode}`);
  }

  getMode() {
    return this.mode;
  }

  isOnline() {
    return this.mode === 'online' && this.networkClient?.isSocketConnected();
  }

  getLocalStore() {
    return this.localStore;
  }

  getNetworkClient() {
    return this.networkClient;
  }

  async executeAction<TResult = any>(
    localAction: () => TResult | Promise<TResult>,
    remoteAction?: () => Promise<TResult>,
  ): Promise<TResult> {
    if (this.mode === 'offline' || !remoteAction) {
      return await localAction();
    }

    try {
      return await remoteAction();
    }
    catch (error) {
      console.error('Remote action failed, falling back to local:', error);
      return await localAction();
    }
  }

  // ============ Player Management ============

  async addPlayer(playerData: { id: string; name: string; avatar?: string }) {
    return this.executeAction(
      () => {
        this.localStore.getState().addPlayer({ ...playerData, score: 0 });
        return this.localStore.getState();
      },
      // TODO: Implement server call when backend is ready
      // async () => {
      //   const client = this.networkClient?.getClient()
      //   if (!client) throw new Error("Network client not configured")
      //   const result = await client.player.add(playerData)
      //   return result
      // }
    );
  }

  async removePlayer(playerId: string) {
    return this.executeAction(
      () => {
        this.localStore.getState().removePlayer(playerId);
        return this.localStore.getState();
      },
      // TODO: Implement server call
      // async () => {
      //   const client = this.networkClient?.getClient()
      //   if (!client) throw new Error("Network client not configured")
      //   // Implement server call here
      // }
    );
  }

  async togglePlayerReady(playerId: string) {
    return this.executeAction(
      () => {
        this.localStore.getState().togglePlayerReady(playerId);
        return this.localStore.getState();
      },
      // TODO: Implement server call
      // async () => {
      //   const client = this.networkClient?.getClient()
      //   if (!client) throw new Error("Network client not configured")
      //   // Implement server call here
      // }
    );
  }

  // ============ Game Lifecycle ============

  async startGame() {
    return this.executeAction(
      () => {
        this.localStore.getState().startGame();
        return this.localStore.getState();
      },
      // TODO: Implement server call
      // async () => {
      //   const client = this.networkClient?.getClient()
      //   if (!client) throw new Error("Network client not configured")
      //   // Implement server call here
      // }
    );
  }

  async endGame() {
    return this.executeAction(
      () => {
        this.localStore.getState().endGame();
        return this.localStore.getState();
      },
      // TODO: Implement server call
      // async () => {
      //   const client = this.networkClient?.getClient()
      //   if (!client) throw new Error("Network client not configured")
      //   // Implement server call here
      // }
    );
  }

  async resetGame() {
    return this.executeAction(
      () => {
        this.localStore.getState().resetGame();
        return this.localStore.getState();
      },
      // TODO: Implement server call
      // async () => {
      //   const client = this.networkClient?.getClient()
      //   if (!client) throw new Error("Network client not configured")
      //   // Implement server call here
      // }
    );
  }

  // ============ Turn Management ============

  async nextTurn() {
    return this.executeAction(
      () => {
        this.localStore.getState().nextTurn();
        return this.localStore.getState();
      },
      // TODO: Implement server call
      // async () => {
      //   const client = this.networkClient?.getClient()
      //   if (!client) throw new Error("Network client not configured")
      //   // Implement server call here
      // }
    );
  }

  // ============ Voting System ============

  async submitVote(playerId: string, isValid: boolean) {
    return this.executeAction(
      () => {
        this.localStore.getState().submitVote(playerId, isValid);
        return this.localStore.getState();
      },
      // TODO: Implement server call
      // async () => {
      //   const client = this.networkClient?.getClient()
      //   if (!client) throw new Error("Network client not configured")
      //   // Implement server call here
      // }
    );
  }

  async startVoting(currentPlayerId: string, totalPlayers: number) {
    return this.executeAction(
      () => {
        this.localStore.getState().startVoting(currentPlayerId, totalPlayers);
        return this.localStore.getState();
      },
      // TODO: Implement server call
      // async () => {
      //   const client = this.networkClient?.getClient()
      //   if (!client) throw new Error("Network client not configured")
      //   // Implement server call here
      // }
    );
  }

  async tallyVotes() {
    return this.executeAction(
      () => {
        this.localStore.getState().tallyVotes();
        return this.localStore.getState();
      },
      // TODO: Implement server call
      // async () => {
      //   const client = this.networkClient?.getClient()
      //   if (!client) throw new Error("Network client not configured")
      //   // Implement server call here
      // }
    );
  }

  // ============ Game Actions ============

  async awardPoint(playerId: string, points = 1) {
    return this.executeAction(
      () => {
        this.localStore.getState().awardPoint(playerId, points);
        return this.localStore.getState();
      },
      // TODO: Implement server call
      // async () => {
      //   const client = this.networkClient?.getClient()
      //   if (!client) throw new Error("Network client not configured")
      //   // Implement server call here
      // }
    );
  }

  async nextQuestion(category?: string) {
    return this.executeAction(
      () => {
        this.localStore.getState().nextQuestion(category);
        return this.localStore.getState();
      },
      // TODO: Implement server call
      // async () => {
      //   const client = this.networkClient?.getClient()
      //   if (!client) throw new Error("Network client not configured")
      //   // Implement server call here
      // }
    );
  }

  subscribeToState<TState = any>(callback: (state: TState) => void) {
    if (this.mode === 'offline') {
      // Subscribe to local store changes
      const store = this.localStore as any;
      if (store.subscribe) {
        return store.subscribe(callback);
      }
      console.warn('Local store does not support subscriptions');
      return () => {};
    }

    // Online mode - subscribe to server events via WebSocket
    const socket = this.networkClient?.getSocket();
    if (!socket) {
      console.warn('WebSocket not available, falling back to local subscription');
      const store = this.localStore as any;
      if (store.subscribe) {
        return store.subscribe(callback);
      }
      return () => {};
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'state_update') {
          callback(data.state);
        }
      }
      catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }
}

export function createGameProxy<TStore = any>(config: GameProxyConfig<TStore>): GameProxy<TStore> {
  return new GameProxy(config);
}
