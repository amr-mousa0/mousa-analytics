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

  constructor(apiKey?: string, model: string = 'gemini-2.5-flash') {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new PermanentError('GEMINI_API_KEY is not configured');
    }
    this.apiKey = key;
    this.model = model;
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

    try {
      await GeminiTranslationProvider.enforceRateLimit();
      
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
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
      
      return translatedText;
    } catch (err: any) {
      Logger.error(`[GeminiTranslationProvider] API Error: ${err.message}`);
      
      if (err.status === 401 || err.status === 403) {
        throw new PermanentError('Authentication failed for Gemini API');
      }
      if (err.status === 429) {
         throw new TransientError('Rate limit exceeded for Gemini API');
      }

      throw new TransientError(`Gemini Translation Failed: ${err.message}`);
    }
  }
}
