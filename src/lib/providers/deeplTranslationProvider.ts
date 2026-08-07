import type { TranslationProvider } from '../../types/providers.js';
import { Logger } from '../utils/logger.js';
import { TransientError, PermanentError } from '../errors.js';

export class DeepLTranslationProvider implements TranslationProvider {
  public id = 'deepl';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DEEPL_API_KEY;
  }

  public async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text || sourceLang === targetLang) return text;
    
    if (!this.apiKey) {
      Logger.warn('[DeepL Provider] DEEPL_API_KEY missing, gracefully skipping to fallback.');
      throw new TransientError('DeepL API Key missing - Graceful Degradation');
    }

    try {
      const response = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `DeepL-Auth-Key ${this.apiKey}`
        },
        body: JSON.stringify({
          text: [text],
          target_lang: targetLang.toUpperCase()
        })
      });

      if (!response.ok) throw new Error(`DeepL HTTP Error: ${response.status}`);
      const data: any = await response.json();
      return data?.translations?.[0]?.text || text;
    } catch (err: any) {
      Logger.error(`[DeepL Provider Error] ${err.message}`);
      throw err;
    }
  }
}
