export type AssetType = 'image' | 'powerbi' | 'pdf' | 'video';

export interface ManifestGalleryItem {
  type: AssetType;
  title?: string;
  url: string;
}

export interface ManifestCapabilities {
  demo?: boolean;
  caseStudy?: boolean;
  cover?: boolean;
  [key: string]: boolean | undefined;
}

export interface ManifestPublishConfig {
  enabled?: boolean;
  visibility?: 'public' | 'internal' | 'private';
  featured?: boolean;
  priority?: number;
  customTitle?: string;
}

export interface RepositoryManifest {
  schemaVersion?: number;
  minimumReaderVersion?: number;
  project?: {
    title?: string;
    description?: string;
    problem?: string;
    solution?: string;
    businessValue?: string;
    technicalHighlights?: string;
    salesDescription?: string;
    salesFunnelMetrics?: string;
    status?: string;
    tags?: string[];
    cover?: string;
    gallery?: ManifestGalleryItem[];
    demo?: string;
    caseStudy?: string;
    capabilities?: ManifestCapabilities;
  };
  publish?: {
    [destination: string]: ManifestPublishConfig | undefined;
  };
}

export interface NormalizedProjectModel {
  projectId: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  problem?: string;
  problemAr?: string;
  solution?: string;
  solutionAr?: string;
  businessValue?: string;
  businessValueAr?: string;
  status: string;
  tags: string[];
  cover?: string;
  gallery: ManifestGalleryItem[];
  demo?: string;
  caseStudy?: string;
  capabilities: ManifestCapabilities;
  publish: Record<string, ManifestPublishConfig>;
  isFallback: boolean;
  sourceRepo?: string;
  updatedAt: string;
}
