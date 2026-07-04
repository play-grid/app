import path from 'node:path';
import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { statItemsTable } from '@/db/stat-items.tables';
import { fetchStatItems } from './stat-items.service';

let sqlite: Database.Database;
let db: ReturnType<typeof drizzle>;

vi.mock('@/db', () => {
  return {
    getDB: vi.fn(() => db),
  };
});

beforeAll(async () => {
  sqlite = new Database(':memory:');
  db = drizzle(sqlite);
  await migrate(db, { migrationsFolder: path.resolve('./drizzle') });

  await db.insert(statItemsTable).values([
    {
      id: 't1',
      entity: 'company',
      category: 'companies',
      name: 'Saudi Aramco',
      nameAr: null,
      metricType: 'logo',
      value: 0,
      unit: 'company',
      source: 'seed',
      status: 'approved',
      imageUrl: 'https://example.com/logo1.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 't2',
      entity: 'company',
      category: 'companies',
      name: 'STC',
      nameAr: 'شركة الاتصالات السعودية',
      metricType: 'logo',
      value: 0,
      unit: 'company',
      source: 'seed',
      status: 'approved',
      imageUrl: 'https://example.com/logo2.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 't3',
      entity: 'company',
      category: 'companies',
      name: 'Al Rajhi Bank',
      nameAr: null,
      metricType: 'logo',
      value: 0,
      unit: 'company',
      source: 'seed',
      status: 'approved',
      imageUrl: 'https://example.com/logo3.png',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
});

afterAll(() => {
  sqlite?.close();
});

describe('fetchStatItems', () => {
  it('should return items with English fallback when AI translation fails', async () => {
    const mockAI = {
      run: vi.fn().mockRejectedValue(new Error('AI unavailable')),
    };

    const mockC = { env: { AI: mockAI } } as any;

    const results = await fetchStatItems(mockC, {
      category: 'companies',
      lang: 'ar',
      status: 'approved',
      limit: 100,
    });

    expect(results).toHaveLength(3);

    const stc = results.find(r => r.id === 't2');
    expect(stc?.nameAr).toBe('شركة الاتصالات السعودية');

    const aramco = results.find(r => r.id === 't1');
    expect(aramco?.nameAr).toBeNull();

    const rajhi = results.find(r => r.id === 't3');
    expect(rajhi?.nameAr).toBeNull();

    expect(mockAI.run).toHaveBeenCalledTimes(1);
  });

  it('should translate items without nameAr via AI and persist translations', async () => {
    const translations: Record<string, string> = {
      'Saudi Aramco': 'أرامكو السعودية',
      'Al Rajhi Bank': 'مصرف الراجحي',
      'company': 'شركة',
    };
    const mockAI = {
      run: vi.fn().mockImplementation(async (_model, { text }) => {
        const translated = text.split('\n').map((line: string) => translations[line] || line).join('\n');
        return { translated_text: translated };
      }),
    };

    const mockC = { env: { AI: mockAI } } as any;

    const results = await fetchStatItems(mockC, {
      category: 'companies',
      lang: 'ar',
      status: 'approved',
      limit: 100,
    });

    expect(results).toHaveLength(3);

    const stc = results.find(r => r.id === 't2');
    expect(stc?.nameAr).toBe('شركة الاتصالات السعودية');

    const aramco = results.find(r => r.id === 't1');
    expect(aramco?.nameAr).toBe('أرامكو السعودية');

    const rajhi = results.find(r => r.id === 't3');
    expect(rajhi?.nameAr).toBe('مصرف الراجحي');

    expect(mockAI.run).toHaveBeenCalledTimes(1);

    const persisted = await db
      .select({ nameAr: statItemsTable.nameAr })
      .from(statItemsTable)
      .where(eq(statItemsTable.id, 't1'));
    expect(persisted[0]?.nameAr).toBe('أرامكو السعودية');
  });
});
