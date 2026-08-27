import { GoogleGenerativeAI } from '@google/generative-ai';
import type { TranslationProvider } from '../../types/providers.js';
import { Logger } from '../utils/logger.js';
import { TransientError, PermanentError } from '../errors.js';

export class GeminiTranslationProvider implements TranslationProvider {
  public id = 'google-gemini';
  private apiKey: string;
  private genAI: GoogleGenerativeAI;
  public readonly model: string;
  public readonly promptVersion = 'v2-strict-technical';

  // 15 RPM Rate Limiting
  private static lastCallTime = 0;
  private static readonly RPM_DELAY_MS = 4000;

  constructor(apiKey?: string, model?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new PermanentError('GEMINI_API_KEY is not configured');
    }
    this.apiKey = key;
    this.model = model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  private static async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLast = now - this.lastCallTime;
    if (timeSinceLast < this.RPM_DELAY_MS) {
      await new Promise(resolve => setTimeout(resolve, this.RPM_DELAY_MS - timeSinceLast));
    }
    this.lastCallTime = Date.now();
  }

  public async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text || sourceLang === targetLang) return text;

    const candidateModels = [
      process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      this.model,
      'gemini-3.6-flash',
      'gemini-3.0-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest'
    ];
    // Deduplicate candidate models
    const uniqueModels = Array.from(new Set(candidateModels));

    let lastError: any = null;

    for (const modelName of uniqueModels) {
      try {
        await GeminiTranslationProvider.enforceRateLimit();
        
        const model = this.genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `You are a professional technical translator. Translate the following text from ${sourceLang} to ${targetLang}.

CRITICAL RULES:
1. Preserve Markdown formatting exactly as it is.
2. Preserve JSON structures exactly as they are.
3. Preserve Code, SQL, File Names, URLs, Keys, and Paths exactly as they are.
4. Only translate human-readable values.
5. Do not add conversational filler.
6. Do not wrap the output in markdown code blocks unless the source text was wrapped in them.

Text to translate:
"${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let translatedText = response.text();

        // Clean up potential formatting added by Gemini
        translatedText = translatedText.replace(/^"|"$/g, '').trim();
        
        if (translatedText) {
          return translatedText;
        }
      } catch (err: any) {
        lastError = err;
        Logger.warn(`[GeminiTranslationProvider] Model ${modelName} failed: ${err.message}. Trying next candidate model...`);
        if (err.status === 401 || err.status === 403) {
          throw new PermanentError('Authentication failed for Gemini API');
        }
      }
    }

    Logger.error(`[GeminiTranslationProvider] All Gemini candidate models failed: ${lastError?.message}`);
    throw new TransientError(`Gemini Translation Failed: ${lastError?.message}`);
  }
}
