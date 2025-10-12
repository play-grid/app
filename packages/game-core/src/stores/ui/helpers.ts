import type { UINotification } from './types';

// Notification builders
export function createSuccessNotification(
  message: string,
  options?: Partial<UINotification>,
): Omit<UINotification, 'id'> {
  return {
    type: 'success',
    message,
    duration: 3000,
    autoClose: true,
    ...options,
  };
}

export function createErrorNotification(
  message: string,
  options?: Partial<UINotification>,
): Omit<UINotification, 'id'> {
  return {
    type: 'error',
    message,
    duration: 5000,
    autoClose: true,
    ...options,
  };
}

export function createWarningNotification(
  message: string,
  options?: Partial<UINotification>,
): Omit<UINotification, 'id'> {
  return {
    type: 'warning',
    message,
    duration: 4000,
    autoClose: true,
    ...options,
  };
}

export function createInfoNotification(
  message: string,
  options?: Partial<UINotification>,
): Omit<UINotification, 'id'> {
  return {
    type: 'info',
    message,
    duration: 3000,
    autoClose: true,
    ...options,
  };
}

// Modal helpers
export const MODAL_IDS = {
  SETTINGS: 'settings',
  PLAYER_LIST: 'player-list',
  GAME_RULES: 'game-rules',
  CONFIRM: 'confirm',
  RESULT: 'result',
} as const;

// Error formatters
export function formatNetworkError(error: any): string {
  if (error?.message?.includes('fetch')) {
    return 'Network error. Please check your connection.';
  }
  if (error?.status === 404) {
    return 'Resource not found.';
  }
  if (error?.status === 500) {
    return 'Server error. Please try again later.';
  }
  return error?.message || 'An unknown error occurred.';
}

export function formatValidationError(field: string, issue: string): string {
  return `${field}: ${issue}`;
}
