/**
 * Feature flags and constants for the frontend
 */

export const FEATURE_FLAGS = {
  SHOW_BANNERS: false,
  FIVE_SECONDS_ONLINE: true,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
