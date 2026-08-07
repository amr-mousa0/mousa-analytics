import type { TranslationProvider } from '../../types/providers.js';
import { GeminiTranslationProvider } from './geminiTranslationProvider.js';
import { DeepLTranslationProvider } from './deeplTranslationProvider.js';
import { LocalTranslationProvider } from './localTranslationProvider.js';
import { TranslationMemory } from './translationMemory.js';
import { Logger } from '../utils/logger.js';

export class TranslationFallbackChain implements TranslationProvider {
  public id = 'fallback-chain';
  private providers: TranslationProvider[];

  constructor() {
    // Pipeline: Gemini -> DeepL -> Local
    this.providers = [
      new GeminiTranslationProvider(),
      new DeepLTranslationProvider(),
      new LocalTranslationProvider()
    ];
  }

  public async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text || sourceLang === targetLang) return text;

    // We assume the first provider (Gemini) owns the prompt model/version for the cache
    const primaryProvider = this.providers[0] as GeminiTranslationProvider;
    const cacheKey = TranslationMemory.generateCacheKey(
      text, 
      sourceLang, 
      targetLang, 
      primaryProvider.model, 
      primaryProvider.promptVersion
    );
    
    const cached = await TranslationMemory.get(cacheKey);

    if (cached) {
      Logger.info(`[CostMonitor] Cache Hits: 1, Gemini Calls: 0, DeepL Calls: 0, Failures: 0`);
      return cached;
    }

    let geminiCalls = 0;
    let deeplCalls = 0;
    let failures = 0;

    for (const provider of this.providers) {
      try {
        Logger.info(`[FallbackChain] Attempting translation via ${provider.id}...`);
        
        if (provider.id === 'google-gemini') geminiCalls++;
        else if (provider.id === 'deepl') deeplCalls++;
        
        const result = await provider.translate(text, sourceLang, targetLang);
        
        if (result && result !== text) {
          // Save to Cache
          await TranslationMemory.set(cacheKey, result);
          
          Logger.info(`[CostMonitor] Cache Hits: 0, Gemini Calls: ${geminiCalls}, DeepL Calls: ${deeplCalls}, Failures: ${failures}`);
          return result;
        }
      } catch (err: any) {
        failures++;
        Logger.warn(`[FallbackChain] Provider ${provider.id} failed: ${err.message}. Trying next provider...`);
      }
    }

    Logger.error(`[CostMonitor] Cache Hits: 0, Gemini Calls: ${geminiCalls}, DeepL Calls: ${deeplCalls}, Failures: ${failures} (Complete Failure)`);
    return text;
  }
}
