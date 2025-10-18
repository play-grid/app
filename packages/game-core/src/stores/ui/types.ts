// Core UI state categories
export interface BaseUIState {
  // Loading states
  isLoading: boolean;
  loadingMessage?: string;

  // Error handling
  error: string | null;
  errorType?: 'network' | 'validation' | 'game' | 'server' | null;

  // Modal/Dialog states
  activeModal: string | null;
  modalData?: Record<string, any>;

  // General UI flags
  isInitialized: boolean;
}

// Actions interface
export interface BaseUIActions {
  // Loading
  setLoading: (loading: boolean, message?: string) => void;

  // Errors
  setError: (error: string | null, type?: BaseUIState['errorType']) => void;
  clearError: () => void;

  // Modals
  openModal: (modalId: string, data?: Record<string, any>) => void;
  closeModal: () => void;

  // Initialization
  initialize: () => void;

  // Reset
  reset: () => void;
}

// Combined store type
export interface UIStore<TCustomState = Record<string, never>>
  extends BaseUIState,
  BaseUIActions {
  // Allow games to extend with custom UI state
  custom: TCustomState;
  updateCustom: (updates: Partial<TCustomState>) => void;
}
