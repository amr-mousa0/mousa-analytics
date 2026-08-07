# ADR 021: Translation Provider Strategy & Caching

## Status
Accepted

## Context
The previous architecture used a highly ambiguous `DefaultTranslationProvider` which could mean anything from mock tests to a silent production external API. Additionally, hitting AI or Machine Translation APIs repeatedly for identical text blocks during pipeline re-runs scales linearly in cost.

## Decision
1. **Explicit Factory Selection:** We implemented a `TranslationProviderFactory`. When `NODE_ENV=production`, it returns a robust `TranslationFallbackChain`. When in development, it strictly returns the `LocalTranslationProvider` (which uses static mock mapping).
2. **Translation Memory Cache (Redis):** The `TranslationFallbackChain` has been wrapped entirely in a Redis (Vercel KV) cache layer.
   - The flow is explicitly: `Redis GET` -> `Gemini` -> `DeepL` -> `Google` -> `Redis SET`.
3. **Deterministic Cache Keys:** The cache key is generated using `SHA256(sourceText + ":" + sourceLang + ":" + targetLang)`. This ensures exact-match translations bypass external providers immediately across cold starts.

## Consequences
- **Positive:** Massive reduction in API translation costs via the persistent Vercel KV store. Clear separation of development (free, instant mock) and production (real API calls) logic. High resiliency due to the Gemini -> DeepL -> Google fallback loop.
- **Negative:** Requires an active Redis / KV instance in production to realize the cost-saving benefits.
