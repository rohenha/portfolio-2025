interface MetadataProps {
  siteName: string;
  siteUrl: string;
  lang: string;
  locale: string;
  suffixTitle: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  robots: string;
  ogType: string;
  ogTitle: string;
  ogDescription: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  colorMeta: string;
  metas: Array<{ content: string; type: string; key: string }>;
}
