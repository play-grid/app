/**
 * Feature flags and constants for the frontend
 */

export const FEATURE_FLAGS = {
  SHOW_BANNERS: false, // Toggle to show/hide banner carousel
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
