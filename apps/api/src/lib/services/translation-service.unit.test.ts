import { describe, expect, it, vi } from 'vitest';
import { TranslationService } from './translation-service';

describe('translationService', () => {
  describe('translateText', () => {
    it('should translate English text to Arabic', async () => {
      const mockAI = {
        run: vi.fn().mockResolvedValue({ translated_text: 'مرحبا' }),
      } as any;

      const service = new TranslationService(mockAI);

      const result = await service.translateText('Hello', 'ar');

      expect(result).toBe('مرحبا');
      expect(mockAI.run).toHaveBeenCalledWith('@cf/meta/m2m100-1.2b', {
        text: 'Hello',
        source_lang: 'en',
        target_lang: 'ar',
      });
    });

    it('should translate Arabic text to English', async () => {
      const mockAI = {
        run: vi.fn().mockResolvedValue({ translated_text: 'Hello' }),
      } as any;

      const service = new TranslationService(mockAI);

      const result = await service.translateText('مرحبا', 'en');

      expect(result).toBe('Hello');
      expect(mockAI.run).toHaveBeenCalledWith('@cf/meta/m2m100-1.2b', {
        text: 'مرحبا',
        source_lang: 'ar',
        target_lang: 'en',
      });
    });

    it('should default target language to Arabic', async () => {
      const mockAI = {
        run: vi.fn().mockResolvedValue({ translated_text: 'مرحبا' }),
      } as any;

      const service = new TranslationService(mockAI);

      const result = await service.translateText('Hello');

      expect(result).toBe('مرحبا');
      expect(mockAI.run).toHaveBeenCalledWith('@cf/meta/m2m100-1.2b', {
        text: 'Hello',
        source_lang: 'en',
        target_lang: 'ar',
      });
    });
  });

  describe('translateBatch', () => {
    it('should translate multiple requests in a single batched AI call', async () => {
      const mockAI = {
        run: vi.fn().mockResolvedValue({ translated_text: 'مرحبا\nعالم\nترحيب' }),
      } as any;

      const service = new TranslationService(mockAI);

      const requests = [
        { text: 'Hello', sourceLang: 'en', targetLang: 'ar' },
        { text: 'World', sourceLang: 'en', targetLang: 'ar' },
        { text: 'Welcome', sourceLang: 'en', targetLang: 'ar' },
      ];

      const results = await service.translateBatch(requests);

      expect(results).toHaveLength(3);
      expect(results[0].translatedText).toBe('مرحبا');
      expect(results[1].translatedText).toBe('عالم');
      expect(results[2].translatedText).toBe('ترحيب');
      expect(mockAI.run).toHaveBeenCalledTimes(1);
      expect(mockAI.run).toHaveBeenCalledWith('@cf/meta/m2m100-1.2b', {
        text: 'Hello\nWorld\nWelcome',
        source_lang: 'en',
        target_lang: 'ar',
      });
    });

    it('should return empty array for empty input', async () => {
      const mockAI = {
        run: vi.fn(),
      } as any;

      const service = new TranslationService(mockAI);

      const results = await service.translateBatch([]);

      expect(results).toEqual([]);
      expect(mockAI.run).not.toHaveBeenCalled();
    });

    it('should throw error on AI failure', async () => {
      const mockAI = {
        run: vi.fn().mockRejectedValue(new Error('AI error')),
      } as any;

      const service = new TranslationService(mockAI);

      const requests = [{ text: 'Hello', sourceLang: 'en', targetLang: 'ar' }];

      await expect(service.translateBatch(requests)).rejects.toThrow('Translation failed');
    });
  });

  describe('translateStatItemFields', () => {
    it('should translate stat item name and unit fields', async () => {
      const mockAI = {
        run: vi.fn().mockResolvedValue({ translated_text: 'الطول\nسنتيمتر\nالوزن\nكيلوغرام' }),
      } as any;

      const service = new TranslationService(mockAI);

      const items = [
        { name: 'Height', unit: 'cm' },
        { name: 'Weight', unit: 'kg' },
      ];

      const results = await service.translateStatItemFields(items, 'ar');

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        nameAr: 'الطول',
        unitAr: 'سنتيمتر',
      });
      expect(results[1]).toEqual({
        nameAr: 'الوزن',
        unitAr: 'كيلوغرام',
      });
      expect(mockAI.run).toHaveBeenCalledTimes(1);
    });

    it('should translate stat item name, unit, and hint fields', async () => {
      const mockAI = {
        run: vi.fn().mockResolvedValue({ translated_text: 'الطول\nسنتيمتر\nقاس من الرأس إلى القدمين\nالوزن\nكيلوغرام\nقاس كتلة الجسم' }),
      } as any;

      const service = new TranslationService(mockAI);

      const items = [
        { name: 'Height', unit: 'cm', hint: 'Measure from head to toe' },
        { name: 'Weight', unit: 'kg', hint: 'Measure body mass' },
      ];

      const results = await service.translateStatItemFields(items, 'ar');

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        nameAr: 'الطول',
        unitAr: 'سنتيمتر',
        hintAr: 'قاس من الرأس إلى القدمين',
      });
      expect(results[1]).toEqual({
        nameAr: 'الوزن',
        unitAr: 'كيلوغرام',
        hintAr: 'قاس كتلة الجسم',
      });
      expect(mockAI.run).toHaveBeenCalledTimes(1);
    });

    it('should handle items without hints', async () => {
      const mockAI = {
        run: vi.fn().mockResolvedValue({ translated_text: 'الطول\nسنتيمتر\nالوزن\nكيلوغرام\nالعمر\nسنة\nقاس بالسنوات' }),
      } as any;

      const service = new TranslationService(mockAI);

      const items = [
        { name: 'Height', unit: 'cm', hint: null },
        { name: 'Weight', unit: 'kg', hint: undefined },
        { name: 'Age', unit: 'years', hint: 'Measure in years' },
      ];

      const results = await service.translateStatItemFields(items, 'ar');

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({
        nameAr: 'الطول',
        unitAr: 'سنتيمتر',
      });
      expect(results[1]).toEqual({
        nameAr: 'الوزن',
        unitAr: 'كيلوغرام',
      });
      expect(results[2]).toEqual({
        nameAr: 'العمر',
        unitAr: 'سنة',
        hintAr: 'قاس بالسنوات',
      });
      expect(mockAI.run).toHaveBeenCalledTimes(1);
    });

    it('should translate to English when targetLang is en', async () => {
      const mockAI = {
        run: vi.fn().mockResolvedValue({ translated_text: 'Height\nCentimeter' }),
      } as any;

      const service = new TranslationService(mockAI);

      const items = [{ name: 'الطول', unit: 'سنتيمتر' }];

      const results = await service.translateStatItemFields(items, 'en');

      expect(results[0]).toEqual({
        nameAr: 'Height',
        unitAr: 'Centimeter',
      });
      expect(mockAI.run).toHaveBeenCalledWith('@cf/meta/m2m100-1.2b', {
        text: 'الطول\nسنتيمتر',
        source_lang: 'en',
        target_lang: 'en',
      });
    });
  });
});
