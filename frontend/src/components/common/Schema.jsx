import { Helmet } from 'react-helmet-async';

const Schema = ({ type, data }) => {
  const generateSchema = () => {
    const baseUrl = window.location.origin;

    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "News Marketplace",
          "url": baseUrl,
          "logo": `${baseUrl}/logo.png`,
          "description": "A leading digital media marketplace connecting content creators with global publications",
          "email": "thesheikhmedia@gmail.com",
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "thesheikhmedia@gmail.com",
            "contactType": "customer service"
          },
          "sameAs": [
            "https://t.me/VisibilityExperts"
          ]
        };

      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.headline || data.title,
          "description": data.description,
          "author": {
            "@type": "Person",
            "name": data.author || "News Marketplace Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "News Marketplace",
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo.png`
            }
          },
          "datePublished": data.datePublished,
          "dateModified": data.dateModified || data.datePublished,
          "image": data.image ? [data.image] : [`${baseUrl}/logo.png`],
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": data.url || window.location.href
          },
          "articleSection": data.articleSection || "News"
        };

      case 'person': // For Podcasters, Authors, Professionals
        return {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": data.name,
          "jobTitle": data.jobTitle,
          "description": data.description,
          "image": data.image,
          "url": data.url || window.location.href,
          "sameAs": data.socialLinks || []
        };

      case 'real-estate':
        return {
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "name": data.title,
          "description": data.description,
          "image": data.image ? [data.image] : [],
          "datePosted": data.datePosted,
          "price": data.price,
          "priceCurrency": data.currency || "USD",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": data.location
          }
        };

      case 'event':
        return {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": data.name,
          "startDate": data.startDate,
          "endDate": data.endDate,
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "eventStatus": "https://schema.org/EventScheduled",
          "location": {
            "@type": "Place",
            "name": data.locationName || "Venue",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": data.location
            }
          },
          "image": data.image ? [data.image] : [],
          "description": data.description
        };

      case 'howto':
        return {
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": data.title,
          "description": data.description,
          "step": data.steps.map((step, index) => ({
            "@type": "HowToStep",
            "position": index + 1,
            "name": step.title,
            "text": step.description,
            "image": step.image,
            "url": step.url
          }))
        };

      case 'webpage':
        return {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": data.title,
          "description": data.description,
          "url": data.url || window.location.href
        };

      case 'collection':
        return {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": data.title,
          "description": data.description,
          "url": data.url || window.location.href,
          "hasPart": data.items ? data.items.map(item => ({
            "@type": "CreativeWork",
            "name": item.title,
            "url": item.url
          })) : []
        };

      case 'service':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": data.name,
          "description": data.description,
          "provider": {
            "@type": "Organization",
            "name": "News Marketplace",
            "logo": `${baseUrl}/logo.png`
          },
          "areaServed": data.areaServed || "Global",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": data.catalogName || "Services",
            "itemListElement": data.services ? data.services.map(s => ({
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": s.name
              }
            })) : []
          }
        };

      case 'contact':
        return {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": data.title,
          "description": data.description,
          "url": data.url || window.location.href,
          "mainEntity": {
            "@type": "Organization",
            "name": "News Marketplace",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+971-50-123-4567",
              "contactType": "customer service",
              "email": "partnerships@newsmarketplace.com"
            }
          }
        };

      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };

      default:
        return null;
    }
  };

  const schema = generateSchema();

  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default Schema;