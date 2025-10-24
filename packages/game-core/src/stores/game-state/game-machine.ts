import { createMachine } from 'xstate';

export const gameMachine = createMachine({
  id: 'game',
  initial: 'lobby',
  states: {
    lobby: { on: { START: 'playing' } },
    playing: { on: { END: 'gameOver' } },
    gameOver: { on: { RESTART: 'lobby' } },
  },
});
