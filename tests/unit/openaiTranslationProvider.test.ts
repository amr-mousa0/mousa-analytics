import { describe, it, expect, vi } from 'vitest';
import { OpenAITranslationProvider } from '../../src/lib/providers/openaiTranslationProvider.js';

describe('OpenAITranslationProvider', () => {
  it('returns original text if source and target languages are equal', async () => {
    const provider = new OpenAITranslationProvider('fake-key');
    const result = await provider.translate('Hello', 'en', 'en');
    expect(result).toBe('Hello');
  });

  it('translates text using OpenAI API mock', async () => {
    const provider = new OpenAITranslationProvider('fake-key');
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(async () => {
      return new Response(JSON.stringify({
        choices: [{ message: { content: 'مرحبا' } }]
      }), { status: 200 });
    });

    const result = await provider.translate('Hello', 'en', 'ar');
    expect(result).toBe('مرحبا');
  });
});
