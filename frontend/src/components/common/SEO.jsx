import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
  nofollow = false,
  language = 'en',
  geo = {} // { region, placename, position }
}) => {
  const siteName = 'VaaS Solutions: Vision to Visibility, Instantly';
  const defaultImage = '/logo.png';
  const defaultUrl = 'https://vaas.solutions';
  const location = useLocation();
  const currentPath = location.pathname;

  const metaTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || 'Discover, create, and share premium news content. Join our community of writers and readers.';
  const metaKeywords = keywords || 'news, marketplace, articles, journalism, writers, readers, content creation';

  // Normalize image URL
  let metaImage = image || defaultImage;
  if (metaImage && !metaImage.startsWith('http') && !metaImage.startsWith('data:')) {
    metaImage = `${defaultUrl}${metaImage.startsWith('/') ? '' : '/'}${metaImage}`;
  }

  const metaUrl = url || `${defaultUrl}${currentPath}`;

  const robots = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;

  // Supported languages for hreflang
  const languages = ['en', 'ar', 'fr', 'hi', 'ru', 'zh'];

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

      {/* Open Graph tags */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={language} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:site" content="@VisibilityExperts" />

      {/* Canonical URL */}
      <link rel="canonical" href={metaUrl} />

      {/* Hreflang for international SEO */}
      {languages.map((lang) => (
        <link
          key={lang}
          rel="alternate"
          hreflang={lang}
          href={`${defaultUrl}${currentPath}?lng=${lang}`}
        />
      ))}
      <link rel="alternate" hreflang="x-default" href={`${defaultUrl}${currentPath}`} />

      {/* Geo-targeting tags (GEO) */}
      <meta name="geo.region" content={geo.region || "AE"} />
      <meta name="geo.placename" content={geo.placename || "Dubai"} />
      <meta name="geo.position" content={geo.position || "25.2048;55.2708"} />
      <meta name="ICBM" content={geo.position || "25.2048, 55.2708"} />

      {/* Additional meta tags for best practices */}
      <meta name="author" content="News Marketplace" />
      <meta name="application-name" content="News Marketplace" />

      {/* RSS Feed link */}
      <link rel="alternate" type="application/rss+xml" title="News Marketplace Blog RSS Feed" href="https://vaas.solutions/rss.xml" />
    </Helmet>
  );
};

export default SEO;