/** Structured data (JSON-LD) shared by prerendering and client-side navigation. */
export function buildPageSchema(options: {
  plainPath: string;
  title: string;
  description: string;
  url: string;
  origin: string;
  locale: 'en' | 'zh';
}): Record<string, unknown> {
  const { plainPath, title, description, url, origin, locale } = options;
  const inLanguage = locale === 'zh' ? 'zh-CN' : 'en';
  const organization = {
    '@type': 'Organization',
    name: 'VISIONGO',
    url: origin,
    logo: `${origin}/favicon.svg`,
    email: 'contact@visiongo.app',
  };

  if (plainPath.startsWith('/resources/')) {
    return {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: title,
      name: title,
      description,
      url,
      inLanguage,
      author: { '@type': 'Organization', name: 'VISIONGO Engineering' },
      publisher: organization,
    };
  }

  if (plainPath.startsWith('/products/') || plainPath === '/downloads') {
    const slug = plainPath.startsWith('/products/') ? plainPath.slice('/products/'.length) : 'visiongo';
    const names: Record<string, string> = {
      visionstudio: 'VisionStudio',
      visionruntime: 'VisionRuntime',
      visionedge: 'VisionEdge',
      visioncloud: 'VisionCloud',
      visiongo: 'VISIONGO Industrial Vision Platform',
    };
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url,
      inLanguage,
      publisher: organization,
      mainEntity: {
        '@type': 'SoftwareApplication',
        name: names[slug] || 'VISIONGO',
        applicationCategory: 'BusinessApplication',
        operatingSystem: slug === 'visioncloud' ? 'Web' : 'Windows, Linux',
        description,
        publisher: organization,
      },
    };
  }

  if (plainPath === '/') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url,
      inLanguage,
      publisher: organization,
      isPartOf: {
        '@type': 'WebSite',
        name: 'VISIONGO',
        url: origin,
      },
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    inLanguage,
    publisher: organization,
  };
}
