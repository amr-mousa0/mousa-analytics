import type { TranslationProvider } from '../../types/providers.js';
import { TranslationFallbackChain } from './translationFallbackChain.js';
import { LocalTranslationProvider } from './localTranslationProvider.js';

export class TranslationProviderFactory {
  public static getProvider(): TranslationProvider {
    if (process.env.NODE_ENV === 'production') {
      return new TranslationFallbackChain();
    }
    return new LocalTranslationProvider();
  }
}
