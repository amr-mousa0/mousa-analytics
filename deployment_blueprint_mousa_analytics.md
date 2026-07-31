# 🚀 Master GitHub Deployment & Automatic Sync Blueprint
> **الدليل الكامل والمرجع الشامل لإعداد الـ Deployment التلقائي ونظام المزامنة الذكية لمشروع "موسى أناليتكس" (Mousa Analytics)**

---

## 📋 جدول المحتويات
1. [الهيكلية العامة ونمط البناء المزدوج (Vercel & GitHub Pages)](#1-الهيكلية-العامة-ونمط-البناء-المزدوج)
2. [إعدادات Astro للبرودكشن (`astro.config.mjs`)](#2-إعدادات-astro-للبرودكشن-astroconfigmjs)
3. [ملف البناء التلقائي لـ GitHub Actions (`.github/workflows/ci.yml`)](#3-ملف-البناء-التلقائي-لـ-github-actions)
4. [قواعد الأمان وتصفية ملفات الإنتاج (`.gitignore`)](#4-قواعد-الأمان-وتصفية-ملفات-الإنتاج-gitignore)
5. [نظام المزامنة التلقائية والـ Webhook (`/api/webhook/github.ts`)](#5-نظام-المزامنة-التلقائية-والـ-webhook)
6. [نظام عرض الـ PDF الحصري ومقاومة برنامج IDM (`/api/pdf-proxy.ts`)](#6-نظام-عرض-الـ-pdf-الحصري-ومقاومة-برنامج-idm)
7. [إدارة بيانات المشاريع وضمان ظهورها في البرودكشن (`src/data/projects.json`)](#7-إدارة-بيانات-المشاريع-وضمان-ظهورها-في-البرودكشن)

---

## 1. الهيكلية العامة ونمط البناء المزدوج
المشروع مجهز بدعم كامل للبناء المستقر على **Vercel** (مع دعم الـ Server Functions و API Endpoints) و **GitHub Pages** (مع المسار التلقائي للـ Static Base):

```
                       ┌──────────────────────────┐
                       │   GitHub Main Branch     │
                       └────────────┬─────────────┘
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌───────────────────────┐                       ┌───────────────────────┐
│     Vercel Build      │                       │  GitHub Actions CI    │
│  (@astrojs/vercel)    │                       │  (Astro Build Verify) │
└───────────┬───────────┘                       └───────────┬───────────┘
            │                                               │
            ▼                                               ▼
   Live Vercel App                                  GitHub Pages Static
```

---

## 2. إعدادات Astro للبرودكشن (`astro.config.mjs`)

قم بتثبيت محول Vercel الخاص بـ Astro 5:
```bash
npm install -D vite --legacy-peer-deps
npm install @astrojs/vercel@8 --legacy-peer-deps
```

ثم انسخ هذا الكود في `astro.config.mjs`:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://amr-mousa0.github.io', // استبدله بدومين الموقع الخاص بك
  base: process.env.VERCEL ? '/' : '/Mousa-Analytics/', // التفرقة التلقائية بين Vercel و GitHub Pages

  adapter: vercel(),

  i18n: {
    defaultLocale: "en",
    locales: ["en", "ar"],
    routing: {
      prefixDefaultLocale: false
    }
  },

  image: {
    domains: ['raw.githubusercontent.com', 'avatars.githubusercontent.com', 'github.com']
  },

  integrations: [],

  vite: {
    plugins: [tailwindcss()],
    css: {
      transformer: 'lightningcss'
    },
    build: {
      cssMinify: 'lightningcss'
    }
  }
});
```

---

## 3. ملف البناء التلقائي لـ GitHub Actions (`.github/workflows/ci.yml`)

أنشئ ملفاً بالمسار `.github/workflows/ci.yml` وانسخ الكود التالي:

```yaml
name: CI / Verify Astro Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    name: Verify Astro Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Project
        run: npm run build
```

---

## 4. قواعد الأمان وتصفية ملفات الإنتاج (`.gitignore`)

انسخ هذا الملف للحفاظ على نماء ونظافة المستودع ومنع رفع أي ملفات حساسّة أو أجزاء AI أو أدوات تطوير داخلية:

```gitignore
# Build output & caches
dist/
.astro/
.cache/
.vercel/

# Dependencies
node_modules/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Environment variables & secrets
.env
.env.*

# OS & IDE metadata
.DS_Store
.idea/
.vscode/
*.swp
*.tmp

# Playwright & Lighthouse test artifacts
playwright-report/
test-results/
blob-report/
.lighthouseci/
playwright.config.ts
lighthouserc.json
run-qa.bat
e2e/
tests/
test-output.txt
read_lh_report.js

# Internal AI Tooling, Agents & Specs (STRICTLY PRIVATE)
.agent/
.agents/
.impeccable/
.specify/
.github/agents/
.github/prompts/
.github/copilot-instructions.md
specs/
scratch/
AGENTS.md
CONSTITUTION.md
DESIGN.md
PRODUCT.md
QA_INSTRUCTIONS.md
session_checkpoint.md
skills-lock.json
task.md

# Internal scripts & legacy scratch files
add_gigs_trans.cjs
update_*.cjs
code.html
index.legacy.html
demo-scroll-driven-720-comp.mp4
landing-page-project/
my-project/
agy/
```

---

## 5. نظام المزامنة التلقائية والـ Webhook (`/api/webhook/github.ts`)

أنشئ هذا المسار في مشروعك `src/pages/api/webhook/github.ts` لتلقي تحديثات المشاريع من GitHub تلقائياً عند إضافة أي مشروع جديد:

```typescript
import type { APIRoute } from 'astro';
import crypto from 'crypto';

export const prerender = false;

function verifySignature(payloadText: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = `sha256=${hmac.update(payloadText).digest('hex')}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export const POST: APIRoute = async ({ request }) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const payloadText = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  // 1. Verify HMAC Signature
  if (secret && !verifySignature(payloadText, signature, secret)) {
    return new Response(JSON.stringify({ error: 'Invalid HMAC signature' }), { status: 401 });
  }

  const payload = JSON.parse(payloadText);
  const eventType = request.headers.get('x-github-event') || 'push';

  if (eventType === 'ping') {
    return new Response(JSON.stringify({ message: 'Webhook active and connected!' }), { status: 200 });
  }

  // 2. Trigger automatic project sync logic
  console.log(`[Webhook] Received ${eventType} event for repo: ${payload.repository?.name}`);

  return new Response(JSON.stringify({ status: 'success', event: eventType }), { status: 200 });
};
```

### ⚙️ كيفية إعداد الـ Webhook على GitHub:
1. اذهب لإعدادات مستودعك على GitHub -> **Settings** -> **Webhooks** -> **Add webhook**.
2. **Payload URL**: ضع رابط الـ API الخاص بك (مثال: `https://mousa-analytics.vercel.app/api/webhook/github`).
3. **Content type**: اختر `application/json`.
4. **Secret**: ضع كلمة سر قوية وضفها في متغيرات Vercel باسم `GITHUB_WEBHOOK_SECRET`.
5. **Which events**: اختر `Just the push event`.

---

## 6. نظام عرض الـ PDF الحصري ومقاومة برنامج IDM (`/api/pdf-proxy.ts`)

لتجنب اعتراض برنامج IDM (Internet Download Manager) على ويندوز وفتح نافذة التحميل بدلاً من عرض الملف داخل المتصفح، أنشئ الممر التالي `src/pages/api/pdf-proxy.ts`:

```typescript
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing URL parameter', { status: 400 });
  }

  try {
    const res = await fetch(targetUrl);
    
    if (!res.ok) {
      return new Response('PDF file fetch failed', { status: res.status });
    }

    const pdfBuffer = await res.arrayBuffer();

    // نستخدم application/octet-stream لمنع IDM من اعتراض الملف وعرضه في Canvas عبر PDF.js
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    return new Response('Internal proxy error', { status: 500 });
  }
};
```

---

## 7. إدارة بيانات المشاريع وضمان ظهورها في البرودكشن

لضمان عدم اختفاء أي مشروع عند الرفع على السيرفر الحي (Vercel / Production)، قم دائماً بحفظ المشاريع في الملف الأساسي المتبع `src/data/projects.json` والمرفوع في الـ Git:

```json
[
  {
    "id": "project-1",
    "title": "Project Title",
    "titleAr": "عنوان المشروع بالعربية",
    "category": "Data Analytics",
    "description": "Project summary description",
    "descriptionAr": "وصف المشروع بالعربية",
    "images": [
      "/images/project-1/cover.jpg"
    ],
    "githubUrl": "https://github.com/amr-mousa0/project-1",
    "powerBiUrl": "https://app.powerbi.com/view?r=...",
    "tech": ["Power BI", "SQL", "Excel"]
  }
]
```

---
> 💡 **نصيحة ذهبية**: عند البدء في مشروع **"موسى أناليتكس" (Mousa Analytics)**، قم بنسخ هذا الملف واعتماده كمرجع مباشر لتوفير ساعات من إعدادات الـ CI/CD والـ Webhooks! 🚀
