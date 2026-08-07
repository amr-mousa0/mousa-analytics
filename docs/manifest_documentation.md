# Manifest JSON Documentation

## Overview
The `manifest.json` file is the contract between a GitHub repository and the Amr Portfolio Orchestration Pipeline. It defines how a repository should be ingested, formatted, presented, and published.

## Discovery & Parsing
1. **Discovery:** The Orchestration Pipeline (`GitHubWorker`) fetches the `manifest.json` from the root of the selected repository branch.
2. **Validation:** Before any processing begins, the raw JSON is parsed through strict Zod schemas (`ManifestSchema`). Any invalid field structures result in a `PermanentError`, safely failing the job.
3. **Fallback:** If `manifest.json` is completely absent, the pipeline falls back to an AI-driven extraction mechanism parsing `README.md` and the file tree, injecting a synthetically generated manifest.

## Structure
```json
{
  "version": "1.0",
  "project": {
    "title": "SQL Practice Level 1",
    "description": "Short summary",
    "problem": "The core issue",
    "solution": "The technical solution",
    "businessValue": "ROI / Metric improvements",
    "status": "production",
    "tags": ["SQL", "Data Analytics"],
    "cover": "assets/cover.webp",
    "gallery": [
      {
        "type": "image",
        "title": "Architecture Diagram",
        "url": "assets/arch.png"
      }
    ],
    "demo": "https://example.com/demo",
    "caseStudy": "docs/case_study.pdf",
    "capabilities": {
      "realTime": true,
      "offline": false
    }
  },
  "publish": {
    "portfolio": {
      "enabled": true,
      "visibility": "public",
      "featured": true,
      "priority": 1
    }
  }
}
```

## Security Rules for Assets
Any field referencing a file path (`cover`, `gallery[].url`, `caseStudy`) must adhere to:
1. **No Path Traversal:** `../` sequences are forbidden.
2. **No Absolute Paths:** Paths must be strictly relative (e.g., `assets/img.png`).
3. **No External Injection:** `http://` or `https://` URLs are forbidden (unless bypassing the asset pipeline entirely, but standard injection assumes repository assets).
4. **Allowed Extensions:** `png, jpg, jpeg, webp, gif, pdf, sql, pbix, py, ts`

Any violation of these security boundaries immediately halts the ingestion pipeline with a `PermanentError`.
