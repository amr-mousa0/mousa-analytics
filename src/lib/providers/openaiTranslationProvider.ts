import type { TranslationProvider } from '../../types/providers.js';
import { Logger } from '../utils/logger.js';
import { TransientError, PermanentError } from '../errors.js';

/**
 * @deprecated 
 * This provider is NO LONGER IN RUNTIME USE as per ADR-023.
 * It is preserved purely as an abstraction reference in case 
 * stakeholder requirements pivot back to OpenAI in the future.
 */
export class OpenAITranslationProvider implements TranslationProvider {
  public id = 'openai';
  private apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new PermanentError('OPENAI_API_KEY is not configured');
    }
    this.apiKey = key;
  }

  public async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text || sourceLang === targetLang) return text;

    try {
      // Mocked out since it's deprecated. If we ever restore this, we'll implement standard OpenAI fetch here.
      Logger.warn('[OpenAITranslationProvider] This provider is deprecated and should not be executed in production.');
      return text;
    } catch (err: any) {
      throw new TransientError(`OpenAI Translation Failed: ${err.message}`);
    }
  }
}
