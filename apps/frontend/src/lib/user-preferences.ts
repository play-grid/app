const USER_PREFERENCES_KEY = 'user-preferences';

interface UserPreferences {
  mobileWarningDismissed?: boolean;
  [key: string]: any;
}

export function getUserPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(USER_PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : {};
  }
  catch {
    return {};
  }
}

export function setUserPreferences<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K],
): void {
  try {
    const current = getUserPreferences();
    current[key] = value;
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(current));
  }
  catch {
    // Silent fail if localStorage is unavailable
  }
}

export { USER_PREFERENCES_KEY };
export type { UserPreferences };
