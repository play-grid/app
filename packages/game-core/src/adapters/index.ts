// Export local adapter
export { createLocalAdapter } from './local/zustand-store';

export { createMultiplayerAdapter } from './multiplayer/client/multiplayer.adapter';
export { createNativeWSClient } from './multiplayer/client/native-ws-client';

// Export types
export type { GameAdapter, StateListener, Unsubscribe } from './types';
