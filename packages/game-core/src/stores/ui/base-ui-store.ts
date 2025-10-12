import type { UINotification, UIStore } from './types';

export function createBaseUIStore<TCustomState = Record<string, never>>(
  initialCustomState: TCustomState = {} as TCustomState,
) {
  return (set: any, get: any): UIStore<TCustomState> => {
    let notificationCounter = 0;

    return {
      // ============ Initial State ============
      isLoading: false,
      loadingMessage: undefined,
      error: null,
      errorType: null,
      activeModal: null,
      modalData: undefined,
      notifications: [],
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

      // ============ Notifications ============
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${notificationCounter++}`;
        const newNotification: UINotification = {
          id,
          duration: 5000,
          autoClose: true,
          ...notification,
        };

        set((state: any) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove after duration
        if (newNotification.autoClose && newNotification.duration) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id) => {
        set((state: any) => ({
          notifications: state.notifications.filter((n: UINotification) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
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
          notifications: [],
          isInitialized: false,
          custom: initialCustomState,
        });
      },
    };
  };
}
