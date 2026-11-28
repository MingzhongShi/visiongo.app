export interface Product {
  id: 'visionstudio' | 'visionruntime' | 'visionedge' | 'visioncloud';
  slug: string;
  name: string;
  shortAction: 'Build' | 'Run' | 'Assist' | 'Extend';
  positioning: string;
  tagline: string;
  summary: string;
  description: string;
  accentColor: string;
  badge: string;
  highlights: string[];
  keyCapabilities: {
    title: string;
    description: string;
    icon: string;
  }[];
  architectureRole: string;
  deploymentTarget: string;
  connectivityRequirement: string;
  sampleCodeOrConfig?: {
    filename: string;
    language: string;
    code: string;
  };
}

export interface Solution {
  id: string;
  slug: string;
  category?: 'task' | 'industry';
  title: string;
  shortDescription: string;
  fullDescription: string;
  industry: string;
  pipeline?: string[];
  keyBenefits: string[];
  recommendedStack: string[];
}

export interface ResourceArticle {
  id: string;
  slug: string;
  type: 'Article' | 'Tutorial' | 'Case Study' | 'Release Note';
  category?: 'tutorial' | 'architecture' | 'troubleshooting' | 'checklist';
  title: string;
  summary: string;
  date: string;
  readTime: string;
  author: string;
  tags: string[];
  contentMarkdown?: string;
}

export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
  children?: {
    label: string;
    href: string;
    description?: string;
    badge?: string;
  }[];
}
