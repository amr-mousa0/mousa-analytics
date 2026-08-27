import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getPdfProxy } from '../../src/pages/api/pdf-proxy.js';

describe('PDF Proxy Endpoint (/api/pdf-proxy)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when url parameter is missing', async () => {
    const request = new Request('http://localhost:4321/api/pdf-proxy', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const url = new URL('http://localhost:4321/api/pdf-proxy');
    const response = await getPdfProxy({ request, url } as any);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain('Missing target PDF URL');
  });

  it('returns HTML 400 when url parameter is missing and client accepts HTML', async () => {
    const request = new Request('http://localhost:4321/api/pdf-proxy', {
      method: 'GET',
      headers: { 'Accept': 'text/html' }
    });
    const url = new URL('http://localhost:4321/api/pdf-proxy');
    const response = await getPdfProxy({ request, url } as any);

    expect(response.status).toBe(400);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('Missing target PDF URL');
  });

  it('successfully proxies PDF on direct 200 response', async () => {
    const mockPdfData = new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer; // %PDF magic bytes
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(mockPdfData, {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' }
      })
    );

    const request = new Request('http://localhost:4321/api/pdf-proxy?url=https://example.com/test.pdf', {
      method: 'GET',
    });
    const url = new URL('http://localhost:4321/api/pdf-proxy?url=https://example.com/test.pdf');
    const response = await getPdfProxy({ request, url } as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toBe('inline');
    expect(response.headers.get('Cache-Control')).toContain('max-age=86400');
  });

  it('sets attachment Content-Disposition when download=1', async () => {
    const mockPdfData = new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer;
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(mockPdfData, {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' }
      })
    );

    const request = new Request('http://localhost:4321/api/pdf-proxy?url=https://example.com/test.pdf&download=1', {
      method: 'GET',
    });
    const url = new URL('http://localhost:4321/api/pdf-proxy?url=https://example.com/test.pdf&download=1');
    const response = await getPdfProxy({ request, url } as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Disposition')).toContain('attachment');
  });

  it('smartly resolves matching PDF from GitHub repo contents when direct raw URL returns 404', async () => {
    const mockPdfData = new Uint8Array([0x25, 0x50, 0x44, 0x46]).buffer;
    const targetUrl = 'https://raw.githubusercontent.com/amr-mousa0/MAEV-Social-Media-Strategy-/main/MAEV%20DIGITAL%20MEDIA%20STRATEGY.pdf';
    const realResolvedDownloadUrl = 'https://raw.githubusercontent.com/amr-mousa0/MAEV-Social-Media-Strategy-/main/MAEV%20Social%20Media%20Strategy%20.pdf';

    const fetchSpy = vi.spyOn(global, 'fetch');
    // 1st call: direct fetch -> 404
    fetchSpy.mockResolvedValueOnce(new Response('Not Found', { status: 404 }));
    // 2nd call: GitHub API contents endpoint -> returns list containing the real PDF file
    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          {
            name: 'MAEV Social Media Strategy .pdf',
            path: 'MAEV Social Media Strategy .pdf',
            type: 'file',
            download_url: realResolvedDownloadUrl
          },
          {
            name: 'README.md',
            path: 'README.md',
            type: 'file',
            download_url: 'https://raw.githubusercontent.com/amr-mousa0/MAEV-Social-Media-Strategy-/main/README.md'
          }
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );
    // 3rd call: fetch resolved real PDF -> 200 OK
    fetchSpy.mockResolvedValueOnce(
      new Response(mockPdfData, {
        status: 200,
        headers: { 'Content-Type': 'application/pdf' }
      })
    );

    const request = new Request(`http://localhost:4321/api/pdf-proxy?url=${encodeURIComponent(targetUrl)}`, {
      method: 'GET',
    });
    const url = new URL(`http://localhost:4321/api/pdf-proxy?url=${encodeURIComponent(targetUrl)}`);
    const response = await getPdfProxy({ request, url } as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('renders graceful error card HTML if client is an iframe (Accept: text/html) and fetch completely fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response('Not Found', { status: 404 }));

    const request = new Request('http://localhost:4321/api/pdf-proxy?url=https://raw.githubusercontent.com/amr-mousa0/nonexistent/main/missing.pdf', {
      method: 'GET',
      headers: { 'Accept': 'text/html,application/xhtml+xml' }
    });
    const url = new URL('http://localhost:4321/api/pdf-proxy?url=https://raw.githubusercontent.com/amr-mousa0/nonexistent/main/missing.pdf');
    const response = await getPdfProxy({ request, url } as any);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('Document Preview');
    expect(html).toContain('View on GitHub');
  });
});
