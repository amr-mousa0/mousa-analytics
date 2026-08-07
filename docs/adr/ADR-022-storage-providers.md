# ADR 022: Storage Provider Interfaces & Lifecycle

## Status
Accepted

## Context
The previous `StorageProvider` abstraction was extremely loose, only implementing `upload()`, `delete()`, and `getPublicUrl()`. It also utilized `Buffer` payloads which are fatal to memory when handling huge objects.
Additionally, the local disk provider originally wrote to `public/assets`, colliding with actual source code assets.

## Decision
1. **Strong Typings (AssetUpload):** `upload()` now takes a unified `AssetUpload` object encompassing `stream`, `mimeType`, `size`, `hash`, and `filename`.
2. **Full Lifecycle Interface:** The `StorageProvider` interface was expanded to own file downloads (`download(key)` returning a Stream) and project-specific saves (`saveProject`).
3. **Official SDKs:** `VercelBlobStorageProvider` uses `@vercel/blob` SDK and `S3StorageProvider` uses `@aws-sdk/client-s3`. This guarantees robust multipart uploads, retry semantics, and future-proof compatibility over manual raw REST implementation.
4. **Local Development Isolation:** `LocalDiskStorageProvider` throws a fatal error if initialized in `production`. In development, it pipes streams securely to `public/generated-assets`, preserving the separation between core system assets and dynamically ingested project files.

## Consequences
- **Positive:** Standardized contracts for multiple clouds. The local disk provider is immune to production execution. Use of SDKs reduces bugs and maintenance overhead compared to REST.
- **Negative:** Hard dependency on SDK packages (`@vercel/blob` and `@aws-sdk/client-s3`).
