import type { Actor, EventFromLogic, SnapshotFrom, StateMachine } from 'xstate';
import type { StoreApi } from 'zustand';
import { createActor } from 'xstate';

/**
 * XState middleware for Zustand
 * Allows you to easily put your XState state machines into a global zustand store.
 */

export interface XStateStore<M extends StateMachine<any, any, any, any, any, any, any, any, any, any, any>> {
  state: SnapshotFrom<M>;
  send: (event: EventFromLogic<M>) => void;
  actor: Actor<M>;
}

export function xstate<M extends StateMachine<any, any, any, any, any, any, any, any, any, any, any>>(machine: M, actorOptions?: Actor<M>['options']) {
  return (set: StoreApi<XStateStore<M>>['setState']): XStateStore<M> => {
    const actor = createActor(machine, actorOptions).start();
    actor.subscribe((state) => {
      set({ state });
    });

    return {
      state: actor.getSnapshot(),
      send: actor.send,
      actor,
    } as XStateStore<M>;
  };
}

export default xstate;
