import type { TranslationProvider } from '../../types/providers.js';
import { Logger } from '../utils/logger.js';

export class GoogleTranslationProvider implements TranslationProvider {
  public id = 'google';

  constructor(private apiKey?: string) {}

  public async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text || sourceLang === targetLang) return text;
    const key = this.apiKey || process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!key) {
      Logger.warn('[Google Provider] GOOGLE_TRANSLATE_API_KEY missing, using echo.');
      return text;
    }

    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target: targetLang })
      });

      if (!response.ok) throw new Error(`Google Translate HTTP Error: ${response.status}`);
      const data: any = await response.json();
      return data?.data?.translations?.[0]?.translatedText || text;
    } catch (err: any) {
      Logger.error(`[Google Provider Error] ${err.message}`);
      throw err;
    }
  }
}
