import type { UIStore } from './types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createBaseUIStore } from './base-ui-store';

export interface CreateUIStoreConfig<TCustomState> {
  name: string;
  initialCustomState?: TCustomState;
  devtools?: boolean;
}

export function createUIStore<TCustomState = Record<string, never>>(
  config: CreateUIStoreConfig<TCustomState>,
) {
  const { name, initialCustomState, devtools: shouldDevtools = true } = config;

  const storeCreator = (set: any, get: any): UIStore<TCustomState> => ({
    ...createBaseUIStore<TCustomState>(initialCustomState)(set, get),
  });

  let store: any = immer(storeCreator);

  if (shouldDevtools) {
    store = devtools(store, { name: `${name}UIStore` });
  }

  return create<UIStore<TCustomState>>()(store);
}
