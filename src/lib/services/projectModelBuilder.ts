import type { RepositoryManifest, NormalizedProjectModel, ManifestGalleryItem } from '../../types/manifest.js';
import type { ContentSourceTreeItem } from '../../types/providers.js';

export interface FallbackInput {
  repoName: string;
  manifest?: RepositoryManifest;
  tree?: ContentSourceTreeItem[];
  readmeContent?: string;
  githubPagesUrl?: string;
}

/**
 * Intelligent Fallback Engine (project-model-builder.ts)
 * 
 * MANIFEST AUTHORITY RULE:
 * 1. If a field exists in manifest.json -> ALWAYS use it.
 * 2. Fallback Engine MAY ONLY fill missing (undefined) fields.
 * 3. Fallback Engine MUST NEVER overwrite declared values.
 * 4. Empty arrays or explicit false/null values are considered intentional choices.
 */
export function buildNormalizedProjectModel(input: FallbackInput): NormalizedProjectModel {
  const { repoName, manifest, tree = [], readmeContent, githubPagesUrl } = input;
  const projectDecl = manifest?.project;
  const publishDecl = manifest?.publish;

  const isManifestPresent = Boolean(manifest && manifest.project);
  let isFallback = !isManifestPresent;

  // 1. Title Resolution (Manifest Authority)
  const title = projectDecl?.title ?? formatRepoNameTitle(repoName);
  if (projectDecl?.title === undefined) isFallback = true;

  // 2. Description & Summary Resolution
  const description = projectDecl?.description ?? extractReadmeSummary(readmeContent) ?? `Data & Analytics project repository for ${repoName}.`;
  
  // 3. Problem / Solution / Business Value (Preserve declared values)
  const problem = projectDecl?.problem ?? extractSectionFromReadme(readmeContent, ['problem', 'challenge', 'المشكلة']);
  const solution = projectDecl?.solution ?? extractSectionFromReadme(readmeContent, ['solution', 'architecture', 'الحل']);
  const businessValue = projectDecl?.businessValue ?? extractSectionFromReadme(readmeContent, ['business value', 'impact', 'results', 'القيمة']);

  // 4. Status
  const status = projectDecl?.status ?? 'production';

  // 5. Tech Tags Resolution
  const tags = projectDecl?.tags !== undefined
    ? projectDecl.tags
    : autoDiscoverTagsFromTree(tree);

  // 6. Cover Image Resolution (Manifest Authority)
  const cover = projectDecl?.cover !== undefined
    ? projectDecl.cover
    : discoverCoverFromTree(tree);

  // 7. Gallery Asset Resolution (Manifest Authority)
  const gallery: ManifestGalleryItem[] = projectDecl?.gallery !== undefined
    ? projectDecl.gallery.map(item => ({
        ...item,
        url: item.url ?? item.file ?? ''
      }))
    : autoDiscoverGalleryFromTree(tree, readmeContent);

  // 8. Demo URL Resolution
  const demo = projectDecl?.demo !== undefined
    ? projectDecl.demo
    : (githubPagesUrl ?? extractPowerBiUrlFromReadme(readmeContent));

  // 9. Case Study Resolution
  const caseStudy = projectDecl?.caseStudy !== undefined
    ? projectDecl.caseStudy
    : `/projects/${slugify(repoName)}`;

  // 10. Capabilities Matrix
  const hasPdfInGallery = gallery.some(g => g.type === 'pdf');
  const hasDemo = Boolean(demo);
  const hasCover = Boolean(cover);
  const hasCaseStudy = Boolean(caseStudy || readmeContent);

  const capabilities = {
    demo: projectDecl?.capabilities?.demo ?? hasDemo,
    caseStudy: projectDecl?.capabilities?.caseStudy ?? hasCaseStudy,
    cover: projectDecl?.capabilities?.cover ?? hasCover,
    hasPdf: hasPdfInGallery,
    hasPowerBi: gallery.some(g => g.type === 'powerbi'),
    hasVideo: gallery.some(g => g.type === 'video'),
    ...projectDecl?.capabilities
  };

  // 11. Publishing Targets Resolution
  const publish = publishDecl !== undefined
    ? publishDecl
    : {
        portfolio: {
          enabled: true,
          visibility: 'public',
          featured: false,
          priority: 99,
          customTitle: title
        }
      };

  return {
    projectId: slugify(repoName),
    title,
    description,
    problem,
    solution,
    businessValue,
    status,
    tags,
    cover,
    gallery,
    demo,
    caseStudy,
    capabilities,
    publish: publish as Record<string, any>,
    isFallback,
    sourceRepo: repoName,
    updatedAt: new Date().toISOString()
  };
}

// --- Helper Functions ---

function formatRepoNameTitle(repoName: string): string {
  return repoName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractReadmeSummary(readme?: string): string | undefined {
  if (!readme) return undefined;
  const lines = readme.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('![')) {
      return trimmed.slice(0, 280);
    }
  }
  return undefined;
}

function extractSectionFromReadme(readme: string | undefined, headers: string[]): string | undefined {
  if (!readme) return undefined;
  const regex = new RegExp(`(?:#+|\\*\\*)\\s*(?:${headers.join('|')})[\\s:*#]*\\n+([\\s\\S]*?)(?=\\n#+|\\n\\*\\*|$)`, 'i');
  const match = readme.match(regex);
  return match ? match[1].trim().slice(0, 500) : undefined;
}

function autoDiscoverTagsFromTree(tree: ContentSourceTreeItem[]): string[] {
  const tags = new Set<string>();
  tree.forEach(item => {
    const path = item.path.toLowerCase();
    if (path.endsWith('.pbix')) tags.add('Power BI');
    if (path.endsWith('.py')) tags.add('Python');
    if (path.endsWith('.sql')) tags.add('SQL Server');
    if (path.endsWith('.dbt') || path.includes('dbt_project')) tags.add('dbt');
    if (path.endsWith('.astro') || path.includes('astro.config')) tags.add('Astro');
    if (path.endsWith('.ts') || path.endsWith('.tsx')) tags.add('TypeScript');
  });
  if (tags.size === 0) tags.add('Data Analytics');
  return Array.from(tags);
}

function discoverCoverFromTree(tree: ContentSourceTreeItem[]): string | undefined {
  const coverCandidate = tree.find(item => {
    const path = item.path.toLowerCase();
    return (
      path === 'cover.png' ||
      path === 'cover.webp' ||
      path === 'cover.jpg' ||
      path === 'assets/cover.png' ||
      path === 'assets/cover.webp' ||
      path === 'assets/showcase-cover.webp'
    );
  });

  if (coverCandidate) return coverCandidate.path;

  const firstImage = tree.find(item => {
    const path = item.path.toLowerCase();
    return path.startsWith('assets/') || path.startsWith('images/')
      ? (path.endsWith('.png') || path.endsWith('.webp') || path.endsWith('.jpg'))
      : false;
  });

  return firstImage?.path;
}

function autoDiscoverGalleryFromTree(tree: ContentSourceTreeItem[], readme?: string): ManifestGalleryItem[] {
  const items: ManifestGalleryItem[] = [];

  // Discover PDF files
  tree.forEach(item => {
    const path = item.path.toLowerCase();
    if (path.endsWith('.pdf')) {
      items.push({
        type: 'pdf',
        title: item.path.split('/').pop() || 'Technical Documentation',
        url: item.path
      });
    }
  });

  // Discover Images
  tree.forEach(item => {
    const path = item.path.toLowerCase();
    if ((path.startsWith('assets/') || path.startsWith('images/')) &&
        (path.endsWith('.png') || path.endsWith('.webp') || path.endsWith('.jpg')) &&
        !path.includes('cover')) {
      items.push({
        type: 'image',
        title: item.path.split('/').pop() || 'Project Screenshot',
        url: item.path
      });
    }
  });

  // Discover Power BI link from Readme
  const pbiUrl = extractPowerBiUrlFromReadme(readme);
  if (pbiUrl) {
    items.push({
      type: 'powerbi',
      title: 'Interactive Power BI Dashboard',
      url: pbiUrl
    });
  }

  return items;
}

function extractPowerBiUrlFromReadme(readme?: string): string | undefined {
  if (!readme) return undefined;
  const pbiRegex = /https:\/\/app\.powerbi\.com\/view\?r=[a-zA-Z0-9%_-]+/i;
  const match = readme.match(pbiRegex);
  return match ? match[0] : undefined;
}
