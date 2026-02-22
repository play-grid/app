import * as HttpStatusCodes from 'stoker/http-status-codes';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStatusHandlers } from './create-status-handlers';

describe('createStatusHandlers', () => {
  let mockDb: any;
  let mockTable: any;
  let mockContext: any;

  beforeEach(() => {
    mockDb = {
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
    };

    mockTable = {
      id: { name: 'id' },
      status: { name: 'status' },
    };

    mockContext = {
      get: vi.fn((key: string) => {
        if (key === 'db')
          return mockDb;
        return undefined;
      }),
      req: {
        valid: vi.fn(),
      },
      json: vi.fn().mockReturnThis(),
    };
  });

  it('should create handlers for single item status transitions', async () => {
    const handlers = createStatusHandlers({
      table: mockTable,
      statusField: 'status',
      transitions: {
        approve: { from: ['pending'], to: 'approved' },
      },
    });

    expect(handlers.approve).toBeDefined();
    expect(typeof handlers.approve).toBe('function');
  });

  it('should create bulk handlers for bulk status transitions', async () => {
    const handlers = createStatusHandlers({
      table: mockTable,
      statusField: 'status',
      transitions: {
        approve: { from: ['pending'], to: 'approved' },
      },
    });

    expect(handlers['bulk-approve']).toBeDefined();
    expect(typeof handlers['bulk-approve']).toBe('function');
  });

  it('should create handlers for multiple transitions', async () => {
    const handlers = createStatusHandlers({
      table: mockTable,
      statusField: 'status',
      transitions: {
        approve: { from: ['pending'], to: 'approved' },
        reject: { from: ['pending', 'approved'], to: 'rejected' },
      },
    });

    expect(handlers.approve).toBeDefined();
    expect(handlers['bulk-approve']).toBeDefined();
    expect(handlers.reject).toBeDefined();
    expect(handlers['bulk-reject']).toBeDefined();
  });

  it('should return 404 for invalid transition', async () => {
    const handlers = createStatusHandlers({
      table: mockTable,
      statusField: 'status',
      transitions: {
        approve: { from: ['pending'], to: 'approved' },
      },
    });

    mockContext.req.valid.mockReturnValueOnce({ id: 'test-id' });
    mockDb.returning.mockResolvedValueOnce([]);

    await handlers.approve(mockContext);

    expect(mockContext.json).toHaveBeenCalledWith({ error: 'Item not found or invalid transition' }, HttpStatusCodes.NOT_FOUND);
  });

  it('should return accurate skipped count in bulk operation', async () => {
    const handlers = createStatusHandlers({
      table: mockTable,
      statusField: 'status',
      transitions: {
        approve: { from: ['pending'], to: 'approved' },
      },
    });

    mockContext.req.valid.mockReturnValueOnce({ ids: ['id-1', 'id-2', 'id-3', 'id-4', 'id-5'] });
    mockDb.returning.mockResolvedValueOnce([
      { id: 'id-1', status: 'approved' },
      { id: 'id-2', status: 'approved' },
      { id: 'id-3', status: 'approved' },
    ]);

    await handlers['bulk-approve'](mockContext);

    expect(mockContext.json).toHaveBeenCalledWith({
      updated: 3,
      skipped: 2,
    }, HttpStatusCodes.OK);
  });

  it('should update updatedAt field when provided', async () => {
    const handlers = createStatusHandlers({
      table: mockTable,
      statusField: 'status',
      transitions: {
        approve: { from: ['pending'], to: 'approved' },
      },
      updatedAtField: 'updatedAt',
    });

    mockContext.req.valid.mockReturnValueOnce({ id: 'test-id' });
    mockDb.returning.mockResolvedValueOnce([{ id: 'test-id', status: 'approved', updatedAt: expect.any(Date) }]);

    await handlers.approve(mockContext);

    expect(mockDb.set).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'approved',
        updatedAt: expect.any(Date),
      }),
    );
  });

  it('should return 400 for invalid bulk input', async () => {
    const handlers = createStatusHandlers({
      table: mockTable,
      statusField: 'status',
      transitions: {
        approve: { from: ['pending'], to: 'approved' },
      },
    });

    mockContext.req.valid.mockReturnValueOnce({ invalid: 'data' });

    await handlers['bulk-approve'](mockContext);

    expect(mockContext.json).toHaveBeenCalledWith({ error: 'Invalid input', details: expect.any(String) }, HttpStatusCodes.BAD_REQUEST);
  });
});
