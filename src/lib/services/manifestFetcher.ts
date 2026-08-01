import type { RepositoryManifest } from '../../types/manifest.js';

export interface FetchManifestResult {
  httpStatus: number;
  urlUsed: string;
  manifestFound: boolean;
  manifestParsed: boolean;
  parsedManifest?: RepositoryManifest;
  rawResponse: string;
  error?: string;
}

export async function fetchManifest(
  repoFullName: string,
  branch: string = 'main',
  manifestRawOverride?: string
): Promise<FetchManifestResult> {
  // If manifest content was passed directly in webhook payload or override
  if (manifestRawOverride) {
    const urlUsed = 'payload://manifestRaw';
    try {
      const parsed = JSON.parse(manifestRawOverride);
      console.log(`[Pipeline] [6/14] fetchManifest() Results:`);
      console.log(`  - HTTP status: 200`);
      console.log(`  - URL used: ${urlUsed}`);
      console.log(`  - manifest found?: YES`);
      console.log(`  - manifest parsed?: YES`);
      return {
        httpStatus: 200,
        urlUsed,
        manifestFound: true,
        manifestParsed: true,
        parsedManifest: parsed,
        rawResponse: manifestRawOverride
      };
    } catch (err: any) {
      console.log(`[Pipeline] [6/14] fetchManifest() Results:`);
      console.log(`  - HTTP status: 200`);
      console.log(`  - URL used: ${urlUsed}`);
      console.log(`  - manifest found?: YES`);
      console.log(`  - manifest parsed?: NO (Parse error: ${err.message})`);
      return {
        httpStatus: 200,
        urlUsed,
        manifestFound: true,
        manifestParsed: false,
        rawResponse: manifestRawOverride,
        error: err.message
      };
    }
  }

  const url = `https://api.github.com/repos/${repoFullName}/contents/manifest.json?ref=${encodeURIComponent(branch)}`;
  const headers: Record<string, string> = {
    'User-Agent': 'MousaAnalytics-ContentHub/1.0',
    'Accept': 'application/vnd.github.v3.raw'
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const response = await fetch(url, { headers });
    const httpStatus = response.status;
    const bodyText = await response.text();

    const manifestFound = httpStatus === 200;
    let manifestParsed = false;
    let parsedManifest: RepositoryManifest | undefined = undefined;

    if (manifestFound) {
      try {
        parsedManifest = JSON.parse(bodyText);
        manifestParsed = true;
      } catch (err: any) {
        manifestParsed = false;
      }
    }

    console.log(`[Pipeline] [6/14] fetchManifest() Results:`);
    console.log(`  - HTTP status: ${httpStatus}`);
    console.log(`  - URL used: ${url}`);
    console.log(`  - manifest found?: ${manifestFound ? 'YES' : 'NO'}`);
    console.log(`  - manifest parsed?: ${manifestParsed ? 'YES' : 'NO'}`);

    if (!manifestFound) {
      console.log(`[Pipeline] Exact GitHub API Response:`);
      console.log(`HTTP/1.1 ${httpStatus} ${response.statusText}`);
      console.log(`Body: ${bodyText}`);
    }

    return {
      httpStatus,
      urlUsed: url,
      manifestFound,
      manifestParsed,
      parsedManifest,
      rawResponse: bodyText
    };
  } catch (err: any) {
    console.log(`[Pipeline] [6/14] fetchManifest() Results:`);
    console.log(`  - HTTP status: 0 (Network Error)`);
    console.log(`  - URL used: ${url}`);
    console.log(`  - manifest found?: NO`);
    console.log(`  - manifest parsed?: NO`);
    console.log(`[Pipeline] Exact GitHub API Error: ${err.message}`);

    return {
      httpStatus: 0,
      urlUsed: url,
      manifestFound: false,
      manifestParsed: false,
      rawResponse: '',
      error: err.message
    };
  }
}
