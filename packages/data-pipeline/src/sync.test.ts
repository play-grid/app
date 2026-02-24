import type { StatItemInput, StatItemTransformer } from './types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runSync } from './sync/run-sync';

describe('runSync', () => {
  const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    values: vi.fn(),
    set: vi.fn(),
    where: vi.fn(),
  };

  const mockTable = {
    externalId: vi.fn(),
    category: vi.fn(),
    metricType: vi.fn(),
    isManualOverride: vi.fn(),
    id: vi.fn(),
  };

  const mockTransformer: StatItemTransformer<any> = {
    source: 'test-source',
    category: 'test-category',
    fetch: vi.fn(),
    transform: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should insert new items when no externalId exists', async () => {
    const mockRawData = [{ id: 1, name: 'Test Item' }];
    const mockInput: StatItemInput = {
      entity: 'player',
      category: 'football',
      name: 'Test Player',
      metricType: 'goals',
      value: 10,
      unit: 'goals',
      source: 'test-source',
    };

    mockTransformer.fetch = vi.fn().mockResolvedValue(mockRawData);
    mockTransformer.transform = vi.fn().mockReturnValue([mockInput]);

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    mockDb.select = vi.fn().mockReturnValue(selectChain);

    mockDb.insert = vi.fn().mockReturnValue(mockDb);
    mockDb.values = vi.fn().mockResolvedValue(undefined);

    const result = await runSync(mockTransformer, mockDb as any, { table: mockTable as any });

    expect(result.inserted).toBe(1);
    expect(result.updated).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
    expect(mockDb.insert).toHaveBeenCalledTimes(1);
  });

  it('should update existing items when externalId matches', async () => {
    const mockRawData = [{ id: 1, name: 'Test Item' }];
    const mockInput: StatItemInput = {
      entity: 'player',
      externalId: '123',
      category: 'football',
      name: 'Updated Player',
      metricType: 'goals',
      value: 20,
      unit: 'goals',
      source: 'test-source',
    };

    const existingRecord = {
      id: 'existing-id',
      isManualOverride: false,
    };

    mockTransformer.fetch = vi.fn().mockResolvedValue(mockRawData);
    mockTransformer.transform = vi.fn().mockReturnValue([mockInput]);

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([existingRecord]),
    };
    mockDb.select = vi.fn().mockReturnValue(selectChain);

    mockDb.update = vi.fn().mockReturnValue(mockDb);
    mockDb.set = vi.fn().mockReturnValue(mockDb);
    const updateWhereMock = vi.fn().mockResolvedValue(undefined);
    mockDb.where = updateWhereMock;

    const result = await runSync(mockTransformer, mockDb as any, { table: mockTable as any });

    expect(result.inserted).toBe(0);
    expect(result.updated).toBe(1);
    expect(mockDb.update).toHaveBeenCalledTimes(1);
  });

  it('should skip items marked as manual override', async () => {
    const mockRawData = [{ id: 1, name: 'Test Item' }];
    const mockInput: StatItemInput = {
      entity: 'player',
      externalId: '123',
      category: 'football',
      name: 'Manual Override Player',
      metricType: 'goals',
      value: 30,
      unit: 'goals',
      source: 'test-source',
    };

    const existingRecord = {
      id: 'existing-id',
      isManualOverride: true,
    };

    mockTransformer.fetch = vi.fn().mockResolvedValue(mockRawData);
    mockTransformer.transform = vi.fn().mockReturnValue([mockInput]);

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([existingRecord]),
    };
    mockDb.select = vi.fn().mockReturnValue(selectChain);

    const result = await runSync(mockTransformer, mockDb as any, { table: mockTable as any });

    expect(result.inserted).toBe(0);
    expect(result.updated).toBe(0);
    expect(result.skipped).toBe(1);
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it('should handle transform errors gracefully', async () => {
    const mockRawData = [{ id: 1, name: 'Test Item' }, { id: 2, name: 'Bad Item' }];

    mockTransformer.fetch = vi.fn().mockResolvedValue(mockRawData);
    mockTransformer.transform = vi.fn()
      .mockReturnValueOnce([{ entity: 'player', category: 'football', name: 'Good', metricType: 'goals', value: 10, unit: 'goals', source: 'test-source' }])
      .mockImplementationOnce(() => { throw new Error('Transform error'); });

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    mockDb.select = vi.fn().mockReturnValue(selectChain);

    mockDb.insert = vi.fn().mockReturnValue(mockDb);
    mockDb.values = vi.fn().mockResolvedValue(undefined);

    const result = await runSync(mockTransformer, mockDb as any, { table: mockTable as any });

    expect(result.errors).toBe(1);
    expect(result.inserted).toBe(1);
  });

  it('should return duration', async () => {
    const mockRawData = [{ id: 1, name: 'Test Item' }];
    const mockInput: StatItemInput = {
      entity: 'player',
      category: 'football',
      name: 'Test',
      metricType: 'goals',
      value: 10,
      unit: 'goals',
      source: 'test-source',
    };

    mockTransformer.fetch = vi.fn().mockResolvedValue(mockRawData);
    mockTransformer.transform = vi.fn().mockReturnValue([mockInput]);

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    mockDb.select = vi.fn().mockReturnValue(selectChain);

    mockDb.insert = vi.fn().mockReturnValue(mockDb);
    mockDb.values = vi.fn().mockResolvedValue(undefined);

    const result = await runSync(mockTransformer, mockDb as any, { table: mockTable as any });

    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(typeof result.duration).toBe('number');
  });

  it('should handle multiple items from single raw data', async () => {
    const mockRawData = [{ id: 1, name: 'Multi-item Player' }];
    const mockInputs: StatItemInput[] = [
      {
        entity: 'player',
        category: 'football',
        name: 'Player',
        metricType: 'goals',
        value: 10,
        unit: 'goals',
        source: 'test-source',
      },
      {
        entity: 'player',
        category: 'football',
        name: 'Player',
        metricType: 'assists',
        value: 5,
        unit: 'assists',
        source: 'test-source',
      },
    ];

    mockTransformer.fetch = vi.fn().mockResolvedValue(mockRawData);
    mockTransformer.transform = vi.fn().mockReturnValue(mockInputs);

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    mockDb.select = vi.fn().mockReturnValue(selectChain);

    mockDb.insert = vi.fn().mockReturnValue(mockDb);
    mockDb.values = vi.fn().mockResolvedValue(undefined);

    const result = await runSync(mockTransformer, mockDb as any, { table: mockTable as any });

    expect(result.inserted).toBe(2);
  });
});
