import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { getEntry, getCollection } from 'astro:content';
import { getSafeSeo } from '../../src/scripts/seoHelper';
import { getSafeServices } from '../../src/scripts/servicesHelper';
import { getSafeSocials } from '../../src/scripts/socialsHelper';

// Mock astro:content module using vi.fn()
vi.mock('astro:content', () => {
  return {
    getEntry: vi.fn(),
    getCollection: vi.fn()
  };
});

describe('Defensive Content Boundary Unit Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getSafeSeo helper', () => {
    it('returns the collection entry data when it exists', async () => {
      vi.mocked(getEntry).mockResolvedValueOnce({
        slug: 'en/homepage',
        data: {
          title: 'Custom Title',
          description: 'Custom Desc',
          keywords: ['key1'],
          ogImage: '/og.png'
        }
      } as any);

      const result = await getSafeSeo('en', 'homepage');
      expect(result.title).toBe('Custom Title');
      expect(result.description).toBe('Custom Desc');
      expect(result.keywords).toContain('key1');
      expect(result.ogImage).toBe('/og.png');
    });

    it('falls back to default SEO configurations if the entry does not exist', async () => {
      vi.mocked(getEntry).mockResolvedValueOnce(null);

      const result = await getSafeSeo('en', 'nonexistent');
      expect(result.title).toBe('Mousa Analytics');
      expect(result.description).toContain('Mousa Analytics: Simplifying data');
    });

    it('falls back to default SEO configurations if the query throws an exception', async () => {
      vi.mocked(getEntry).mockRejectedValueOnce(new Error('DB failure'));

      const result = await getSafeSeo('en', 'homepage');
      expect(result.title).toBe('Mousa Analytics');
    });
  });

  describe('getSafeServices helper', () => {
    it('filters services by language and sorts them by priority', async () => {
      vi.mocked(getCollection).mockResolvedValueOnce([
        {
          slug: 'en/service-2',
          data: { title: 'Service 2', description: 'Desc 2', features: [], priority: 2 }
        },
        {
          slug: 'ar/service-1',
          data: { title: 'Service 1 Arabic', description: 'Desc 1', features: [], priority: 1 }
        },
        {
          slug: 'en/service-1',
          data: { title: 'Service 1', description: 'Desc 1', features: [], priority: 1 }
        }
      ] as any);

      const result = await getSafeServices('en');
      expect(result).toHaveLength(2);
      expect(result[0].data.title).toBe('Service 1');
      expect(result[1].data.title).toBe('Service 2');
    });

    it('returns empty array if services collection is empty', async () => {
      vi.mocked(getCollection).mockResolvedValueOnce([]);

      const result = await getSafeServices('en');
      expect(result).toEqual([]);
    });

    it('returns empty array if collection query throws an error', async () => {
      vi.mocked(getCollection).mockRejectedValueOnce(new Error('Collection failed'));

      const result = await getSafeServices('en');
      expect(result).toEqual([]);
    });
  });

  describe('getSafeSocials helper', () => {
    it('filters socials by language and sorts them by priority', async () => {
      vi.mocked(getCollection).mockResolvedValueOnce([
        {
          slug: 'en/github',
          data: { name: 'GitHub', url: 'https://github.com', icon: 'fa-github', priority: 10 }
        },
        {
          slug: 'en/linkedin',
          data: { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'fa-linkedin', priority: 1 }
        },
        {
          slug: 'ar/linkedin',
          data: { name: 'LinkedIn Arabic', url: 'https://linkedin.com', icon: 'fa-linkedin', priority: 1 }
        }
      ] as any);

      const result = await getSafeSocials('en');
      expect(result).toHaveLength(2);
      expect(result[0].data.name).toBe('LinkedIn');
      expect(result[1].data.name).toBe('GitHub');
    });

    it('returns empty array if socials collection is empty', async () => {
      vi.mocked(getCollection).mockResolvedValueOnce([]);

      const result = await getSafeSocials('en');
      expect(result).toEqual([]);
    });

    it('returns empty array if collection query throws an error', async () => {
      vi.mocked(getCollection).mockRejectedValueOnce(new Error('Collection failed'));

      const result = await getSafeSocials('en');
      expect(result).toEqual([]);
    });
  });
});

describe('Locale Parity Content Checks', () => {
  const contentDir = path.resolve(__dirname, '../../src/content');
  const collections = ['seo', 'services', 'socials'];

  collections.forEach((collection) => {
    it(`enforces identical files in en and ar directories for collection '${collection}'`, () => {
      const enPath = path.join(contentDir, collection, 'en');
      const arPath = path.join(contentDir, collection, 'ar');

      if (!fs.existsSync(enPath) || !fs.existsSync(arPath)) {
        return;
      }

      const enFiles = fs.readdirSync(enPath).filter(f => f.endsWith('.md') || f.endsWith('.yaml') || f.endsWith('.json'));
      const arFiles = fs.readdirSync(arPath).filter(f => f.endsWith('.md') || f.endsWith('.yaml') || f.endsWith('.json'));

      expect(enFiles.sort()).toEqual(arFiles.sort());
    });
  });
});
