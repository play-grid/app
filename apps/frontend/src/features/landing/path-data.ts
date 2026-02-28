export type PathKey = 'player' | 'creator';

export interface Feature {
  icon: string;
  name: string;
  desc: string;
}

export interface GameMode {
  num: string;
  icon: string;
  title: string;
  desc: string;
  tag: string;
}

export interface PathData {
  key: PathKey;
  pathBarLabel: string;
  ctaGhostWord: string;
  ctaTitle: string;
  featTag: string;
  featTitle: string;
  features: Feature[];
  showModes: boolean;
  showBA: boolean;
}

export const GAME_MODES: GameMode[] = [
  {
    num: '01',
    icon: '🧠',
    title: 'Trivia Battles',
    desc: 'Fast-paced knowledge duels across culture, history, sports, and pop. Buzzer in and beat the room.',
    tag: 'Competitive',
  },
  {
    num: '02',
    icon: '🎭',
    title: 'Who\'s Most Likely',
    desc: 'Vote for who in your group matches each wild scenario. Chaos, laughter, and revelations.',
    tag: 'Social',
  },
  {
    num: '03',
    icon: '📖',
    title: 'Story Chains',
    desc: 'Collaborative storytelling where each player adds a twist. No two games are ever the same.',
    tag: 'Creative',
  },
  {
    num: '04',
    icon: '🧩',
    title: 'Memory Challenges',
    desc: 'Test recall against friends in rapid-fire rounds. Train your brain without even noticing.',
    tag: 'Cognitive',
  },
];

export const CREATOR_STEPS = [
  {
    num: '01',
    title: 'Upload Your Content',
    desc: 'Import from PowerPoint, Canva, or build directly in the no-code editor.',
  },
  {
    num: '02',
    title: 'Configure & Publish',
    desc: 'Set rules, timers, categories. Hit publish — your game is live instantly.',
  },
  {
    num: '03',
    title: 'Watch It Run Live',
    desc: 'Real-time multiplayer, state sync, polished UX — all handled by PlayGrid.',
  },
];

export const PATHS: Record<PathKey, PathData> = {
  player: {
    key: 'player',
    pathBarLabel: 'Player Experience',
    ctaGhostWord: 'العب',
    ctaTitle: 'Ready to Play?',
    featTag: '// Player Features',
    featTitle: 'Play anywhere, instantly.',
    showModes: true,
    showBA: false,
    features: [
      {
        icon: '⚡',
        name: 'Instant Join',
        desc: 'No accounts. No forms. Click a link, enter a name — you\'re in. Maximum fun from second zero.',
      },
      {
        icon: '📱',
        name: 'Phone Controller',
        desc: 'Your phone becomes the controller. One big screen becomes the stage for the whole room.',
      },
      {
        icon: '🎮',
        name: 'Diverse Library',
        desc: 'Trivia, storytelling, memory, "Who\'s Most Likely" — every session feels completely different.',
      },
    ],
  },
  creator: {
    key: 'creator',
    pathBarLabel: 'Creator Experience',
    ctaGhostWord: 'اصنع',
    ctaTitle: 'Ready to Create?',
    featTag: '// Creator Tools',
    featTitle: 'Your content, reimagined live.',
    showModes: false,
    showBA: true,
    features: [
      {
        icon: '🧱',
        name: 'No-Code Builder',
        desc: 'Templates, forms, dropdowns — if you can build in PowerPoint, you can build here. No dev needed.',
      },
      {
        icon: '📦',
        name: 'Seamless Import',
        desc: 'Import existing PowerPoint or Canva games instantly. Upgrade content without rebuilding anything.',
      },
      {
        icon: '📊',
        name: 'Creator Dashboard',
        desc: 'Full admin panel. Track plays, ratings, engagement. Complete control over your games and audience.',
      },
    ],
  },
};

export const MARQUEE_ITEMS = [
  'Coming Soon',
  'Full Multiplayer Support',
  'Instant Join & Play',
  'Arabic-First Platform',
  'Creator Monetization',
  'No-Code Builder',
];

export const STATS = [
  { num: '0', unit: 'ms', label: 'Setup Time' },
  { num: '1', unit: '×', label: 'Click to Join' },
  { num: '∞', unit: '', label: 'Sessions' },
  { num: '100', unit: '%', label: 'Arabic First' },
];
