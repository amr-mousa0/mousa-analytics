# ADR 023: Gemini Translation Migration & Free Tier Optimization

## Status
Accepted

## Context
Our original implementation relied on OpenAI for automated translations. While effective, OpenAI incurs continuous API costs which scales poorly with large automated pipeline runs. Additionally, the fallback chain consisted of OpenAI -> DeepL -> Google Translation API. 
Because Google Gemini offers a highly capable Free Tier and is powered by Google's infrastructure, using a separate Google Translation API is redundant and inefficient.
Finally, caching strategies needed to be resilient against prompt engineering changes; if the underlying system prompt is improved, stale cache entries would bypass the new instructions.

## Decision
1. **Primary Provider:** Migrated the primary translation engine to Google Gemini (`gemini-2.5-flash`), utilizing the `@google/generative-ai` SDK.
2. **Rate Limiting:** Gemini Free Tier limits usage to 15 RPM. A built-in queuing system enforces a strict 4000ms delay between translation API calls to prevent `429 Too Many Requests` crashes.
3. **Smart Cache Invalidation:** The Translation Memory Cache Key is now deterministic across the AI model and the specific Prompt Version: `SHA(ModelVersion + PromptVersion + SourceLang + TargetLang + Text)`. Changing the prompt version immediately invalidates stale translations.
4. **Strict Prompts:** A highly strict prompt was engineered to explicitly forbid translating Markdown, JSON, Code, SQL, URLs, and File Paths, ensuring pipeline stability.
5. **Streamlined Fallback:** The chain is now `Gemini -> DeepL (Optional) -> Local`. The Google Translation API was removed. DeepL degrades gracefully if its API key is omitted.
6. **Preserved Abstraction:** `openaiTranslationProvider.ts` was deprecated, not deleted, to maintain abstraction history.

## Consequences
- **Positive:** Pipeline API costs drop to $0. Cache invalidates safely during model/prompt upgrades. Highly resilient fallback.
- **Negative:** Hard limit of 15 translations per minute slows down massive initial batch ingestions.
