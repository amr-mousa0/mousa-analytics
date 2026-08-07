# ADR 020: High-Performance Asset Pipeline

## Status
Accepted

## Context
The previous implementation of `AssetWorker` only mutated strings from relative paths to public URLs. It did not actually download or upload files. Given that a single project might contain 100+ images or 100MB+ PDFs, doing this sequentially or keeping files in memory (Buffers) would crash the Node process and cause heavy latency.
Furthermore, downloading files from a GitHub repository requires strict security validation to prevent Path Traversal and SSRF attacks (e.g. referencing `../../secrets.txt`).

## Decision
1. **Readable Streams:** We will stream the fetch response from GitHub directly into the Cloud Storage providers using Node/Web `ReadableStream` instead of reading into `Buffer`.
2. **Database Caching (AssetRegistry):** A new Prisma table `AssetRegistry` will store the SHA256 checksum of every processed asset. Before uploading, the worker will check this registry to bypass redundant uploads, saving significant cloud costs and bandwidth.
3. **Promise Pooling:** Uploads within a project's `gallery` array will be processed concurrently with a limit of 5 (using `p-limit`), maximizing network throughput without triggering rate limits.
4. **Security Validation:** All asset paths will pass through a strict `SecurityValidator` which blocks absolute paths, external URLs, traversal characters, and validates extensions/mime types.
5. **Resiliency:** The entire fetch/upload loop is wrapped in a retry mechanism with exponential backoff.

## Consequences
- **Positive:** Massive reduction in memory usage for large files. Drastic speedup for projects with many gallery items. Iron-clad security against path exploits. Redundant image uploads across multiple pipeline runs will resolve instantly.
- **Negative:** Increased complexity in error handling and stream reconstruction for checksumming.
