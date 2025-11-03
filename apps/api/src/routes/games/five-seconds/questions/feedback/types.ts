export const feedbackTypes = [
  'annoying',
  'unclear',
  'too_easy',
  'too_hard',
] as const;

export type FeedbackType = typeof feedbackTypes[number];
