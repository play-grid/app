interface Ai {
  run: (model: any, input: any) => Promise<any>;
}

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export interface TranslationResult {
  translatedText: string;
}

export class TranslationService {
  constructor(private ai: Ai) {}

  async translateBatch(requests: TranslationRequest[]): Promise<TranslationResult[]> {
    if (requests.length === 0) {
      return [];
    }

    try {
      const batchText = requests.map(r => r.text).join('\n');
      const response = await this.ai.run('@cf/meta/m2m100-1.2b', {
        text: batchText,
        source_lang: requests[0].sourceLang,
        target_lang: requests[0].targetLang,
      }) as { translated_text: string };

      const translatedLines = response.translated_text.split('\n');
      return requests.map((_, i) => ({
        translatedText: translatedLines[i] || '',
      }));
    }
    catch (error) {
      console.error('Translation error:', error);
      throw new Error('Translation failed');
    }
  }

  async translateText(text: string, targetLang: 'ar' | 'en' = 'ar'): Promise<string> {
    const sourceLang = targetLang === 'ar' ? 'en' : 'ar';
    const result = await this.translateBatch([{ text, sourceLang, targetLang }]);
    return result[0].translatedText;
  }

  async translateStatItemFields(
    items: Array<{ name: string; unit: string; hint?: string | null }>,
    targetLang: 'ar' | 'en' = 'ar',
  ): Promise<Array<{ nameAr?: string; unitAr?: string; hintAr?: string }>> {
    const requests: TranslationRequest[] = [];

    items.forEach((item) => {
      requests.push({ text: item.name, sourceLang: 'en', targetLang });
      requests.push({ text: item.unit, sourceLang: 'en', targetLang });
      if (item.hint) {
        requests.push({ text: item.hint, sourceLang: 'en', targetLang });
      }
    });

    const results = await this.translateBatch(requests);
    const translatedItems: Array<{ nameAr?: string; unitAr?: string; hintAr?: string }> = [];

    let resultIndex = 0;
    items.forEach((item) => {
      const translated: { nameAr?: string; unitAr?: string; hintAr?: string } = {
        nameAr: results[resultIndex++].translatedText,
        unitAr: results[resultIndex++].translatedText,
      };

      if (item.hint) {
        translated.hintAr = results[resultIndex++].translatedText;
      }

      translatedItems.push(translated);
    });

    return translatedItems;
  }
}
