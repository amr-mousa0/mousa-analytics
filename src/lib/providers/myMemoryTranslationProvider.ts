import type { TranslationProvider } from '../../types/providers.js';
import { Logger } from '../utils/logger.js';

export class MyMemoryTranslationProvider implements TranslationProvider {
  public id = 'mymemory-free';

  async translate(text: string, sourceLang: string = 'en', targetLang: string = 'ar'): Promise<string> {
    if (!text || text.trim() === '' || sourceLang === targetLang) return text;

    const isArabic = (t?: string) => t && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(t);

    try {
      const maxChunkLength = 450;
      if (text.length > maxChunkLength) {
        const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
        const translatedChunks: string[] = [];

        for (const sentence of sentences) {
          const trimmed = sentence.trim();
          if (!trimmed) continue;
          const chunkUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sourceLang}|${targetLang}&de=amrmousa240@gmail.com`;
          const res = await fetch(chunkUrl);
          if (res.ok) {
            const data = await res.json();
            const chunkTranslation = data?.responseData?.translatedText;
            if (chunkTranslation && chunkTranslation.trim()) {
              translatedChunks.push(chunkTranslation.trim());
              continue;
            }
          }
          translatedChunks.push(trimmed);
        }

        const fullText = translatedChunks.join(' ');
        if (targetLang === 'ar' && isArabic(fullText)) {
          return fullText;
        }
      }

      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${sourceLang}|${targetLang}&de=amrmousa240@gmail.com`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const translated = data?.responseData?.translatedText;
        if (translated && translated.trim() !== '') {
          const cleaned = translated.replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
          if (targetLang === 'ar' && isArabic(cleaned)) {
            return cleaned;
          }
        }
      }
    } catch (e: any) {
      Logger.warn(`[MyMemoryTranslationProvider] Error: ${e.message}`);
    }

    throw new Error('MyMemory translation failed to produce valid Arabic text.');
  }
}
