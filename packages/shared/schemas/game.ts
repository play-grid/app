import { z } from 'zod';

export const RoomStatusSchema = z.enum(['waiting', 'active', 'finished']);

/**
 * Base schema for a game room (The public Room type)
 */
export const RoomSchema = z.object({
  id: z.string().describe('Unique room ID'),
  name: z.string().min(1, 'room-name-required').max(50, 'room-name-too-long').describe('Room display name'),
  maxPlayers: z.number().int().min(2).max(8).describe('Maximum number of players allowed'),
  currentPlayers: z.number().int().describe('Current number of players in the room'),
  // Game type is a string here, as the frontend doesn't need the full enum registration logic
  gameType: z.string().describe('The identifier for the game being played'),
  isPrivate: z.boolean().describe('Whether the room is visible in the public list'),
  status: RoomStatusSchema.describe('Current state of the room'),
  createdAt: z.iso.datetime().describe('Timestamp of room creation'),
});
export type Room = z.infer<typeof RoomSchema>;

export type RoomStatus = z.infer<typeof RoomStatusSchema>;
