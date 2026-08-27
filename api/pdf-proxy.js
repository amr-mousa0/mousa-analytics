export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query.url;
  const isDownload = req.query.download === '1' || req.query.download === 'true';
  const acceptsHtml = (req.headers.accept || '').includes('text/html');

  if (!targetUrl) {
    if (acceptsHtml) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(renderErrorHtml('Missing target PDF URL parameter'));
    }
    return res.status(400).json({ error: 'Missing target PDF URL parameter' });
  }

  try {
    // 1. Direct Fetch
    let pdfResponse = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mousa-Analytics-Pdf-Proxy' }
    });

    // 2. Smart GitHub auto-resolution if 404
    if (!pdfResponse.ok && targetUrl.includes('raw.githubusercontent.com')) {
      const ghResolvedUrl = await resolveGitHubPdfUrl(targetUrl);
      if (ghResolvedUrl && ghResolvedUrl !== targetUrl) {
        pdfResponse = await fetch(ghResolvedUrl, {
          headers: { 'User-Agent': 'Mousa-Analytics-Pdf-Proxy' }
        });
      }
    }

    // 3. Fallback on persistent failure
    if (!pdfResponse.ok) {
      if (acceptsHtml) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(
          renderErrorHtml(
            'Unable to preview PDF document directly in the browser. You can access the project repository directly.',
            targetUrl
          )
        );
      }
      return res.status(pdfResponse.status).json({ error: 'Remote PDF fetch failed', status: pdfResponse.status });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const disposition = isDownload ? 'attachment; filename="document.pdf"' : 'inline';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', disposition);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    return res.status(200).send(Buffer.from(pdfBuffer));
  } catch (err) {
    if (acceptsHtml) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(renderErrorHtml('Document preview temporarily unavailable.', targetUrl));
    }
    return res.status(500).json({ error: 'PDF delivery proxy exception', details: err?.message });
  }
}

/**
 * Resolves fuzzy/misnamed PDF files from GitHub repositories
 */
async function resolveGitHubPdfUrl(rawUrl) {
  try {
    const rawPattern = /^https?:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/;
    const match = rawUrl.match(rawPattern);
    if (!match) return null;

    const [, owner, repo, branch, requestedPath] = match;
    const decodedPath = decodeURIComponent(requestedPath);
    const directory = decodedPath.includes('/') ? decodedPath.substring(0, decodedPath.lastIndexOf('/')) : '';

    const token = process.env.GITHUB_TOKEN;
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Mousa-Analytics-Pdf-Proxy',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(directory)}?ref=${branch}`;
    const res = await fetch(apiUrl, { headers });

    if (!res.ok) {
      if (directory) {
        const rootRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/?ref=${branch}`, { headers });
        if (rootRes.ok) {
          const items = await rootRes.json();
          return findBestPdfMatch(items);
        }
      }
      return null;
    }

    const items = await res.json();
    return findBestPdfMatch(items);
  } catch {
    return null;
  }
}

function findBestPdfMatch(items) {
  if (!Array.isArray(items)) return null;

  const pdfFiles = items.filter(
    item => item.type === 'file' && item.name.toLowerCase().endsWith('.pdf')
  );

  if (pdfFiles.length === 0) return null;
  return pdfFiles[0].download_url;
}

function renderErrorHtml(message, sourceUrl) {
  const repoUrl = sourceUrl && sourceUrl.includes('raw.githubusercontent.com')
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
