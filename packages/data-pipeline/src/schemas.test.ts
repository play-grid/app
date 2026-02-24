import { describe, expect, it } from 'vitest';
import {
  gameStatItemSchema,
  statItemInputSchema,
  statItemInsertSchema,
  statItemSelectSchema,
} from './schemas';

describe('schemas', () => {
  describe('statItemInputSchema', () => {
    it('should validate a valid stat item input', () => {
      const validInput = {
        entity: 'player',
        externalId: '123',
        category: 'football',
        name: 'Lionel Messi',
        metricType: 'goals',
        value: 25,
        unit: 'goals this season',
        imageUrl: 'https://example.com/photo.jpg',
        hint: 'Inter Miami',
        source: 'api-sports',
        status: 'pending' as const,
      };

      const result = statItemInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    it('should allow optional fields', () => {
      const minimalInput = {
        entity: 'player',
        category: 'football',
        name: 'Player Name',
        metricType: 'goals',
        value: 10,
        unit: 'goals',
        source: 'api-sports',
      };

      const result = statItemInputSchema.parse(minimalInput);
      expect(result).toMatchObject(minimalInput);
    });

    it('should require required fields', () => {
      const invalidInput = {
        entity: 'player',
        name: 'Test',
      };

      expect(() => statItemInputSchema.parse(invalidInput)).toThrow();
    });

    it('should validate image URL format when provided', () => {
      const input = {
        entity: 'player',
        category: 'football',
        name: 'Player',
        metricType: 'goals',
        value: 10,
        unit: 'goals',
        source: 'api-sports',
        imageUrl: 'not-a-valid-url',
      };

      expect(() => statItemInputSchema.parse(input)).toThrow();
    });
  });

  describe('statItemInsertSchema', () => {
    it('should validate a valid insert schema', () => {
      const validInsert = {
        entity: 'player',
        category: 'football',
        name: 'Player Name',
        metricType: 'goals',
        value: 10,
        unit: 'goals',
        source: 'api-sports',
        status: 'approved' as const,
      };

      const result = statItemInsertSchema.parse(validInsert);
      expect(result).toMatchObject(validInsert);
      expect(result.isManualOverride).toBe(false);
    });

    it('should default status to pending', () => {
      const insert = {
        entity: 'player',
        category: 'football',
        name: 'Player Name',
        metricType: 'goals',
        value: 10,
        unit: 'goals',
        source: 'api-sports',
      };

      const result = statItemInsertSchema.parse(insert);
      expect(result.status).toBe('pending');
    });

    it('should allow all status values', () => {
      ['pending', 'approved', 'rejected'].forEach((status) => {
        const insert = {
          entity: 'player',
          category: 'football',
          name: 'Player Name',
          metricType: 'goals',
          value: 10,
          unit: 'goals',
          source: 'api-sports',
          status: status as 'pending' | 'approved' | 'rejected',
        };

        const result = statItemInsertSchema.parse(insert);
        expect(result.status).toBe(status);
      });
    });
  });

  describe('statItemSelectSchema', () => {
    it('should validate a full database record', () => {
      const fullRecord = {
        id: 'cuid123',
        entity: 'player',
        externalId: '123' as null | string,
        category: 'football',
        name: 'Player Name',
        metricType: 'goals',
        value: 10,
        unit: 'goals',
        imageKey: null as null | string,
        imageUrl: 'https://example.com/photo.jpg' as null | string,
        hint: 'Team Name' as null | string,
        source: 'api-sports',
        status: 'approved',
        isManualOverride: false as null | boolean,
        lastSyncedAt: new Date() as Date | null,
        deletedAt: null as Date | null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = statItemSelectSchema.parse(fullRecord);
      expect(result).toEqual(fullRecord);
    });
  });

  describe('gameStatItemSchema', () => {
    it('should only include game-relevant fields', () => {
      const gameItem = {
        id: 'cuid123',
        entity: 'player',
        name: 'Player Name',
        metricType: 'goals',
        value: 10,
        unit: 'goals',
        imageUrl: 'https://example.com/photo.jpg' as null | string,
        hint: 'Team Name' as null | string,
      };

      const result = gameStatItemSchema.parse(gameItem);
      expect(result).toEqual(gameItem);
    });

    it('should reject extra fields', () => {
      const invalidGameItem = {
        id: 'cuid123',
        entity: 'player',
        name: 'Player Name',
        metricType: 'goals',
        value: 10,
        unit: 'goals',
        imageUrl: 'https://example.com/photo.jpg',
        hint: 'Team Name',
        source: 'api-sports',
      };

      const result = gameStatItemSchema.parse(invalidGameItem);
      expect('source' in result).toBe(false);
    });
  });
});
