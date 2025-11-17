const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class PublicationExtractorService {
  // Extract publication information from article URL
  async extractPublicationInfo(articleUrl) {
    try {
      // Validate URL
      const url = new URL(articleUrl);

      // Set headers to mimic a real browser
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      };

      // Fetch the article page
      const response = await axios.get(articleUrl, {
        headers,
        timeout: 10000, // 10 second timeout
        maxRedirects: 5
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract publication information
      const publicationInfo = {
        publication_name: this.extractPublicationName($, url),
        publication_website: this.extractPublicationWebsite(url)
      };

      return publicationInfo;
    } catch (error) {
      console.error('Error extracting publication info:', error.message);
      // Return basic info from URL if extraction fails
      return {
        publication_name: this.extractDomainName(articleUrl),
        publication_website: this.extractPublicationWebsiteFromUrl(articleUrl)
      };
    }
  }

  // Extract publication name from HTML meta tags and page content
  extractPublicationName($, url) {
    // Try Open Graph title
    let name = $('meta[property="og:site_name"]').attr('content');

    if (!name) {
      // Try Twitter card site name
      name = $('meta[name="twitter:site"]').attr('content');
      if (name && name.startsWith('@')) {
        name = name.substring(1);
      }
    }

    if (!name) {
      // Try general meta tags
      name = $('meta[name="application-name"]').attr('content') ||
             $('meta[name="publisher"]').attr('content') ||
             $('meta[name="author"]').attr('content');
    }

    if (!name) {
      // Try title tag and extract domain-like name
      const title = $('title').text().trim();
      if (title) {
        // Remove common suffixes and clean up
        name = title.split('|')[0].split('-')[0].trim();
        // If it's too long, use domain name instead
        if (name.length > 50) {
          name = null;
        }
      }
    }

    // Fallback to domain name
    if (!name) {
      name = this.extractDomainName(url.href);
    }

    return name;
  }

  // Extract publication website from URL
  extractPublicationWebsite(url) {
    try {
      return `${url.protocol}//${url.hostname}`;
    } catch (error) {
      return this.extractPublicationWebsiteFromUrl(url.href);
    }
  }

  // Extract publication website from URL string
  extractPublicationWebsiteFromUrl(urlString) {
    try {
      const url = new URL(urlString);
      return `${url.protocol}//${url.hostname}`;
    } catch (error) {
      // Fallback: extract domain from string
      const match = urlString.match(/https?:\/\/([^\/]+)/);
      return match ? `https://${match[1]}` : urlString;
    }
  }

  // Extract clean domain name for publication name fallback
  extractDomainName(urlString) {
    try {
      const url = new URL(urlString);
      let domain = url.hostname;

      // Remove www.
      if (domain.startsWith('www.')) {
        domain = domain.substring(4);
      }

      // Capitalize first letter of each word
      return domain.split('.')
        .filter(part => part !== 'com' && part !== 'org' && part !== 'net' && part !== 'io')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    } catch (error) {
      return 'Unknown Publication';
    }
  }
}

module.exports = new PublicationExtractorService();