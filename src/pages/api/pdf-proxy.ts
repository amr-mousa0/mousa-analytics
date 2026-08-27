import type { APIRoute } from 'astro';
import { getCorsHeaders } from '../../lib/security/policy.js';

export const prerender = false;

interface GitHubContentItem {
  name: string;
  path: string;
  type: string;
  download_url: string | null;
}

export const GET: APIRoute = async ({ request, url }) => {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  const targetUrl = url.searchParams.get('url');
  const isDownload = url.searchParams.get('download') === '1' || url.searchParams.get('download') === 'true';
  const acceptsHtml = request.headers.get('accept')?.includes('text/html');

  if (!targetUrl) {
    if (acceptsHtml) {
      return new Response(renderErrorHtml('Missing target PDF URL parameter'), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
    return new Response(JSON.stringify({ error: 'Missing target PDF URL parameter' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // 1. First Attempt: Direct Fetch
    let pdfResponse = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mousa-Analytics-Pdf-Proxy' }
    });

    // 2. Second Attempt: Smart GitHub Resolution if raw.githubusercontent.com 404s
    if (!pdfResponse.ok && targetUrl.includes('raw.githubusercontent.com')) {
      const ghResolvedUrl = await resolveGitHubPdfUrl(targetUrl);
      if (ghResolvedUrl && ghResolvedUrl !== targetUrl) {
        pdfResponse = await fetch(ghResolvedUrl, {
          headers: { 'User-Agent': 'Mousa-Analytics-Pdf-Proxy' }
        });
      }
    }

    // 3. Handle persistent failure
    if (!pdfResponse.ok) {
      if (acceptsHtml) {
        return new Response(
          renderErrorHtml(
            'Unable to preview PDF document directly in the browser. You can access the project repository directly.',
            targetUrl
          ),
          {
            status: 200, // 200 so iframe renders cleanly
            headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
          }
        );
      }

      return new Response(JSON.stringify({ error: 'Remote PDF fetch failed', status: pdfResponse.status }), {
        status: pdfResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const disposition = isDownload ? 'attachment; filename="document.pdf"' : 'inline';

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': disposition,
        'Cache-Control': 'public, max-age=86400, immutable'
      }
    });
  } catch (err: any) {
    if (acceptsHtml) {
      return new Response(
        renderErrorHtml('Document preview temporarily unavailable.', targetUrl),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }
    return new Response(JSON.stringify({ error: 'PDF delivery proxy exception', details: err?.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

/**
 * Parses raw.githubusercontent.com URL and queries GitHub API to find the real PDF
 */
async function resolveGitHubPdfUrl(rawUrl: string): Promise<string | null> {
  try {
    const rawPattern = /^https?:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/;
    const match = rawUrl.match(rawPattern);
    if (!match) return null;

    const [, owner, repo, branch, requestedPath] = match;
    const decodedPath = decodeURIComponent(requestedPath);
    const directory = decodedPath.includes('/') ? decodedPath.substring(0, decodedPath.lastIndexOf('/')) : '';

    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Mousa-Analytics-Pdf-Proxy',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    // Query repo contents at the directory or root
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(directory)}?ref=${branch}`;
    const res = await fetch(apiUrl, { headers });

    if (!res.ok) {
      // Fallback: check root directory if subfolder query failed
      if (directory) {
        const rootRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/?ref=${branch}`, { headers });
        if (rootRes.ok) {
          const items = (await rootRes.json()) as GitHubContentItem[];
          return findBestPdfMatch(items);
        }
      }
      return null;
    }

    const items = (await res.json()) as GitHubContentItem[];
    return findBestPdfMatch(items);
  } catch {
    return null;
  }
}

function findBestPdfMatch(items: GitHubContentItem[]): string | null {
  if (!Array.isArray(items)) return null;

  const pdfFiles = items.filter(
    item => item.type === 'file' && item.name.toLowerCase().endsWith('.pdf')
  );

  if (pdfFiles.length === 0) return null;

  // Return the first matching PDF's download_url
  return pdfFiles[0].download_url;
}

function renderErrorHtml(message: string, sourceUrl?: string): string {
  const repoUrl = sourceUrl?.includes('raw.githubusercontent.com')
    ? sourceUrl.replace('raw.githubusercontent.com', 'github.com').replace(/\/main\/.*|\/master\/.*/, '')
    : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Viewer</title>
  <style>
    body {
      margin: 0;
      padding: 2rem;
      background-color: #0f1117;
      color: #94a3b8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      background: #181b26;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1rem;
      padding: 2rem;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .icon {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
      color: #60a5fa;
    }
    .icon svg {
      width: 2.5rem;
      height: 2.5rem;
    }
    h3 {
      color: #f8fafc;
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
    }
    p {
      font-size: 0.875rem;
      line-height: 1.5;
      margin: 0 0 1.5rem 0;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: #2563eb;
      color: #ffffff;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.875rem;
      transition: background 0.2s ease;
    }
    .btn:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    </div>
    <h3>Document Preview</h3>
    <p>${message}</p>
    ${repoUrl ? `<a href="${repoUrl}" target="_blank" rel="noopener noreferrer" class="btn">View on GitHub &rarr;</a>` : ''}
  </div>
</body>
</html>`;
}
