import { describe, expect, it } from 'vitest';
import { getFilteredCustomQuestions } from './use-question';

describe('getFilteredCustomQuestions', () => {
  const questions = [
    { id: 'q1', text: 'Name 3 fruits?', difficulty: 'easy', categoryId: 'general' },
    { id: 'q2', text: 'Name 3 capitals?', difficulty: 'medium', categoryId: 'geography' },
    { id: 'q3', text: 'Name 3 elements?', difficulty: 'hard', categoryId: 'science' },
    { id: 'q4', text: 'Name 3 colors?', difficulty: 'easy', categoryId: 'general' },
    { id: 'q5', text: 'Name 3 rivers?', difficulty: 'medium', categoryId: 'geography' },
  ];

  it('should filter by selected categories', () => {
    const result = getFilteredCustomQuestions(questions, ['general'], 'all', []);
    expect(result).toHaveLength(2);
    expect(result.map(q => q.id).sort()).toEqual(['q1', 'q4']);
  });

  it('should filter by difficulty when not "all"', () => {
    const result = getFilteredCustomQuestions(questions, [], 'medium', []);
    expect(result).toHaveLength(2);
    expect(result.map(q => q.id).sort()).toEqual(['q2', 'q5']);
  });

  it('should return all difficulties when difficulty is "all"', () => {
    const result = getFilteredCustomQuestions(questions, ['general', 'geography', 'science'], 'all', []);
    expect(result).toHaveLength(5);
  });

  it('should exclude seen question IDs', () => {
    const result = getFilteredCustomQuestions(questions, [], 'all', ['q1', 'q2']);
    expect(result).toHaveLength(3);
    expect(result.find(q => q.id === 'q1')).toBeUndefined();
    expect(result.find(q => q.id === 'q2')).toBeUndefined();
  });

  it('should auto-select all categories when categoryIds is empty', () => {
    const result = getFilteredCustomQuestions(questions, [], 'all', []);
    expect(result).toHaveLength(5);
  });

  it('should filter by both category and difficulty', () => {
    const result = getFilteredCustomQuestions(questions, ['general'], 'easy', []);
    expect(result).toHaveLength(2);
    expect(result.map(q => q.id).sort()).toEqual(['q1', 'q4']);
  });

  it('should return empty when no questions match', () => {
    const result = getFilteredCustomQuestions(questions, ['science'], 'easy', []);
    expect(result).toHaveLength(0);
  });

  it('should be case-insensitive for category matching', () => {
    const result = getFilteredCustomQuestions(questions, ['GENERAL'], 'all', []);
    expect(result).toHaveLength(2);
  });

  it('should return empty array for empty questions input', () => {
    const result = getFilteredCustomQuestions([], [], 'all', []);
    expect(result).toHaveLength(0);
  });
});
