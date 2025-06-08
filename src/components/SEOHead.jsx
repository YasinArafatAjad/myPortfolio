import { Helmet } from 'react-helmet-async';
import { useSettings } from '../contexts/SettingsContext';
import { useLocation } from 'react-router-dom';

/**
 * SEO Head component for managing meta tags and structured data
 */
const SEOHead = ({ 
  title = '', 
  description = '', 
  keywords = '', 
  image = '',
  type = 'website',
  noIndex = false 
}) => {
  const { settings } = useSettings();
  const location = useLocation();

  // Generate dynamic title
  const pageTitle = title 
    ? `${title} | ${settings.siteName}` 
    : settings.siteName;

  // Generate meta description
  const metaDescription = description || settings.siteDescription;

  // Generate meta keywords
  const metaKeywords = keywords 
    ? `${keywords}, ${settings.siteKeywords}`
    : settings.siteKeywords;

  // Generate canonical URL
  const canonicalUrl = `${window.location.origin}${location.pathname}`;

  // Generate OG image
  const ogImage = image || settings.seoSettings?.ogImage || `${window.location.origin}/og-image.jpg`;

  // Use logo as favicon if available, otherwise use default
  const faviconUrl = settings.logo || '/favicon.ico';

  // Generate structured data for portfolio
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": settings.siteName,
    "url": window.location.origin,
    "description": metaDescription,
    "image": ogImage,
    "sameAs": Object.values(settings.socialLinks || {}).filter(Boolean)
  };

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={settings.siteName} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Favicon - Multiple formats for better browser support */}
      <link rel="icon" type="image/x-icon" href={faviconUrl} />
      <link rel="icon" type="image/png" href={faviconUrl} />
      <link rel="apple-touch-icon" href={faviconUrl} />
      <link rel="shortcut icon" type="image/x-icon" href={faviconUrl} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={settings.siteName} />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content={settings.seoSettings?.twitterCard || 'summary_large_image'} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Robots meta tag */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Viewport and mobile optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content={settings.primaryColor} />
      
      {/* Performance hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      
      {/* Google Analytics */}
      {settings.seoSettings?.googleAnalytics && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.seoSettings.googleAnalytics}`}
          />
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.seoSettings.googleAnalytics}');
            `}
          </script>
        </>
      )}
      
      {/* Google Site Verification */}
      {settings.seoSettings?.googleSiteVerification && (
        <meta
          name="google-site-verification"
          content={settings.seoSettings.googleSiteVerification}
        />
      )}
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;