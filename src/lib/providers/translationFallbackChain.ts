import type { TranslationProvider } from '../../types/providers.js';
import { GeminiTranslationProvider } from './geminiTranslationProvider.js';
import { DeepLTranslationProvider } from './deeplTranslationProvider.js';
import { LocalTranslationProvider } from './localTranslationProvider.js';
import { TranslationMemory } from './translationMemory.js';
import { Logger } from '../utils/logger.js';
import { TransientError, PermanentError } from '../errors.js';

export class TranslationFallbackChain implements TranslationProvider {
  public id = 'fallback-chain';
  private providers: TranslationProvider[];

  constructor() {
    this.providers = [];
    try {
      this.providers.push(new GeminiTranslationProvider());
    } catch (e: any) {
      Logger.warn(`[TranslationFallbackChain] Gemini init failed: ${e.message}`);
    }
    try {
      this.providers.push(new DeepLTranslationProvider());
    } catch (e: any) {
      Logger.warn(`[TranslationFallbackChain] DeepL init failed: ${e.message}`);
    }
    this.providers.push(new LocalTranslationProvider());
  }

  public async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text || sourceLang === targetLang) return text;

    const cacheKey = TranslationMemory.generateCacheKey(
      text, 
      sourceLang, 
      targetLang, 
      'gemini-1.5-flash', 
      'v2-strict-technical'
    );
    
    const cached = await TranslationMemory.get(cacheKey);

    if (cached) {
      Logger.info(`[CostMonitor] Cache Hits: 1, Gemini Calls: 0, DeepL Calls: 0, Failures: 0`);
      return cached;
    }

    let geminiCalls = 0;
    let deeplCalls = 0;
    let failures = 0;
    let hasTransientFailure = false;

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
        if (err instanceof TransientError) {
          hasTransientFailure = true;
        }
        Logger.warn(`[FallbackChain] Provider ${provider.id} failed: ${err.message}. Trying next provider...`);
      }
    }

    Logger.error(`[CostMonitor] Cache Hits: 0, Gemini Calls: ${geminiCalls}, DeepL Calls: ${deeplCalls}, Failures: ${failures} (Complete Failure)`);
    
    if (hasTransientFailure) {
      throw new TransientError(
        `Translation failed due to transient provider error (Rate Limit/Network). Retrying via QStash.`
      );
    }

    throw new PermanentError(
      `All translation providers failed permanently for text snippet "${text.slice(0, 40)}...". Publication blocked per Fail-Closed policy.`
    );
  }
}
