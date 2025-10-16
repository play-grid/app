import type { UIStore } from './types';

export function createBaseUIStore<TCustomState = Record<string, never>>(
  initialCustomState: TCustomState = {} as TCustomState,
) {
  return (set: any, _get: any): UIStore<TCustomState> => {
    return {
      // ============ Initial State ============
      isLoading: false,
      loadingMessage: undefined,
      error: null,
      errorType: null,
      activeModal: null,
      modalData: undefined,
      isInitialized: false,
      custom: initialCustomState,

      // ============ Loading ============
      setLoading: (loading, message) => {
        set({
          isLoading: loading,
          loadingMessage: message,
        });
      },

      // ============ Error Handling ============
      setError: (error, type = 'game') => {
        set({
          error,
          errorType: error ? type : null,
        });
      },

      clearError: () => {
        set({
          error: null,
          errorType: null,
        });
      },

      // ============ Modals ============
      openModal: (modalId, data) => {
        set({
          activeModal: modalId,
          modalData: data,
        });
      },

      closeModal: () => {
        set({
          activeModal: null,
          modalData: undefined,
        });
      },

      // ============ Custom State ============
      updateCustom: (updates) => {
        set((state: any) => ({
          custom: { ...state.custom, ...updates },
        }));
      },

      // ============ Initialization ============
      initialize: () => {
        set({ isInitialized: true });
      },

      // ============ Reset ============
      reset: () => {
        set({
          isLoading: false,
          loadingMessage: undefined,
          error: null,
          errorType: null,
          activeModal: null,
          modalData: undefined,
          isInitialized: false,
          custom: initialCustomState,
        });
      },
    };
  };
}
