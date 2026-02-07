import z from 'zod';

export const GamePropertiesSchema = z.object({
  game_id: z.string(),
  game_version: z.string().optional(),
  game_mode: z.enum(['local', 'multiplayer']).optional(),
  player_count: z.number().optional(),
  min_players: z.number().optional(),
  max_players: z.number().optional(),
  language: z.string().optional(),
  action: z.string().optional(),
  resumed: z.boolean().optional(),
  room_id: z.string().optional().nullable(),
  selected_set: z.string().optional(),
  selected_grid: z.string().optional(),
  grid_total_logos: z.number().optional(),
});

export const TurnPropertiesSchema = z.object({
  game_id: z.string(),
  turn_number: z.number().optional(),
  round_number: z.number().optional(),
  player_id: z.string().optional(),
});

export const VotePropertiesSchema = z.object({
  game_id: z.string(),
  round_number: z.number().optional(),
  voter_id: z.string().optional(),
  current_player_id: z.string().optional(),
  is_valid: z.boolean().optional(),
});

export const GameCompletionPropertiesSchema = z.object({
  game_id: z.string(),
  winner_id: z.string().optional(),
  final_scores: z.array(z.object({
    id: z.string(),
    name: z.string().optional(),
    score: z.number(),
  })).optional(),
  total_players: z.number().optional(),
  duration_seconds: z.number().optional(),
});

export const GameResetPropertiesSchema = z.object({
  game_id: z.string(),
  reason: z.string().optional(),
  current_phase: z.string().optional(),
});

export const GridChangePropertiesSchema = z.object({
  game_id: z.string(),
  from_size: z.string().optional(),
  to_size: z.string().optional(),
});

export const ListChangePropertiesSchema = z.object({
  game_id: z.string(),
  from_list: z.string().optional(),
  to_list: z.string().optional(),
});

export const AnalyticsEventSchema = z.discriminatedUnion('event', [
  z.object({
    event: z.literal('game_selected'),
    properties: GamePropertiesSchema,
  }),
  z.object({
    event: z.literal('game_start'),
    properties: GamePropertiesSchema,
  }),
  z.object({
    event: z.literal('game_complete'),
    properties: GameCompletionPropertiesSchema,
  }),
  z.object({
    event: z.literal('game_reset'),
    properties: GameResetPropertiesSchema,
  }),
  z.object({
    event: z.literal('game_quit'),
    properties: z.object({ game_id: z.string() }),
  }),
  z.object({
    event: z.literal('game_mode_selected'),
    properties: GamePropertiesSchema,
  }),
  z.object({
    event: z.literal('turn_start'),
    properties: TurnPropertiesSchema,
  }),
  z.object({
    event: z.literal('turn_complete'),
    properties: TurnPropertiesSchema,
  }),
  z.object({
    event: z.literal('vote_submit'),
    properties: VotePropertiesSchema,
  }),
  z.object({
    event: z.literal('grid_size_change'),
    properties: GridChangePropertiesSchema,
  }),
  z.object({
    event: z.literal('list_change'),
    properties: ListChangePropertiesSchema,
  }),
  z.object({
    event: z.literal('turn_switch'),
    properties: TurnPropertiesSchema,
  }),
]);

export type GameProperties = z.infer<typeof GamePropertiesSchema>;
export type TurnProperties = z.infer<typeof TurnPropertiesSchema>;
export type VoteProperties = z.infer<typeof VotePropertiesSchema>;
export type GameCompletionProperties = z.infer<typeof GameCompletionPropertiesSchema>;
export type GameResetProperties = z.infer<typeof GameResetPropertiesSchema>;
export type GridChangeProperties = z.infer<typeof GridChangePropertiesSchema>;
export type ListChangeProperties = z.infer<typeof ListChangePropertiesSchema>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
