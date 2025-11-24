const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const PublishedWork = require('./src/models/PublishedWork');

// List of news websites to scrape articles from
const NEWS_SOURCES = [
  { url: 'https://www.cnn.com', region: 'United States', industry: 'General' },
  { url: 'https://www.bbc.com/news', region: 'United Kingdom', industry: 'General' },
  { url: 'https://www.reuters.com', region: 'Global', industry: 'Business' },
  { url: 'https://www.nytimes.com', region: 'United States', industry: 'General' },
  { url: 'https://www.theguardian.com', region: 'United Kingdom', industry: 'General' },
  { url: 'https://www.wsj.com', region: 'United States', industry: 'Business' },
  { url: 'https://techcrunch.com', region: 'Global', industry: 'Technology' },
  { url: 'https://www.bloomberg.com', region: 'Global', industry: 'Business' }
];

// Industry mapping
const industryMapping = {
  'General': ['General', 'News', 'Current Events'],
  'Business': ['Finance', 'Banking', 'Investment', 'Corporate'],
  'Technology': ['Technology', 'Software', 'AI', 'Gadgets'],
  'Health': ['Healthcare', 'Medical', 'Pharmaceutical'],
  'Science': ['Science', 'Research', 'Innovation'],
  'Sports': ['Sports', 'Athletics', 'Entertainment'],
  'Entertainment': ['Entertainment', 'Media', 'Celebrity']
};

// Country mapping
const countryMapping = {
  'United States': 'United States',
  'United Kingdom': 'United Kingdom',
  'Global': 'United States', // Default for global sources
  'Canada': 'Canada',
  'Australia': 'Australia'
};

// Company names by industry
const companyNames = {
  'Finance': ['Goldman Sachs', 'JPMorgan Chase', 'Morgan Stanley', 'Bank of America', 'Citigroup'],
  'Technology': ['Google', 'Apple', 'Microsoft', 'Amazon', 'Meta', 'Tesla', 'Netflix'],
  'Healthcare': ['Pfizer', 'Johnson & Johnson', 'UnitedHealth Group', 'Merck', 'Abbott Laboratories'],
  'Sports': ['Nike', 'Adidas', 'Under Armour', 'Puma', 'New Balance'],
  'Entertainment': ['Disney', 'Warner Bros', 'Universal Pictures', 'Sony Pictures', 'Netflix'],
  'General': ['Various Companies', 'Local Business', 'International Corp', 'Global Enterprises']
};

// Person names
const personNames = [
  'John Smith', 'Jane Doe', 'Michael Johnson', 'Sarah Williams', 'David Brown',
  'Emma Davis', 'James Miller', 'Olivia Wilson', 'Robert Moore', 'Sophia Taylor',
  'William Anderson', 'Isabella Thomas', 'Charles Jackson', 'Mia White', 'Benjamin Harris'
];

class PublishedWorksPopulator {
  constructor() {
    // No API dependencies needed
  }

  async populatePublishedWorks() {
    try {
      console.log('Starting published works population from direct web scraping...');

      let successCount = 0;
      let errorCount = 0;

      for (const source of NEWS_SOURCES) {
        try {
          const articles = await this.scrapeArticlesFromSource(source);
          console.log(`Scraped ${articles.length} articles from ${source.url}`);

          for (const article of articles) {
            try {
              const workData = await this.buildWorkData(article, source);
              await this.savePublishedWork(workData);
              successCount++;
              console.log(`Saved published work: ${workData.publication_name}`);
            } catch (error) {
              console.error(`Error processing article:`, error.message);
              errorCount++;
            }
          }
        } catch (error) {
          console.error(`Error processing source ${source.url}:`, error.message);
          errorCount++;
        }

        // Add delay between sources to avoid rate limiting
        await this.delay(3000);
      }

      console.log(`Population complete. Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error('Error in populatePublishedWorks:', error);
    }
  }

  async scrapeArticlesFromSource(source) {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 30000 });

      const content = await page.content();
      const $ = cheerio.load(content);

      const articles = [];

      // Different selectors for different news sites
      const selectors = [
        'a[href*="/202"], a[href*="/2024"], a[href*="/2025"]', // Date-based URLs
        'article a, .article a, .story a, .news-item a', // Article links
        'h2 a, h3 a, .headline a' // Headline links
      ];

      for (const selector of selectors) {
        $(selector).each((i, element) => {
          if (articles.length >= 10) return false; // Limit to 10 articles per source

          const $link = $(element);
          const href = $link.attr('href');
          const title = $link.text().trim() || $link.find('img').attr('alt') || 'Article';

          if (href && title && title.length > 10) {
            // Clean up the URL
            let fullUrl = href;
            if (!href.startsWith('http')) {
              fullUrl = href.startsWith('/') ? source.url + href : source.url + '/' + href;
            }

            articles.push({
              title,
              url: fullUrl,
              source: source
            });
          }
        });

        if (articles.length >= 10) break;
      }

      await browser.close();
      return articles.slice(0, 10); // Limit to 10 per source

    } catch (error) {
      console.error(`Error scraping articles from ${source.url}:`, error.message);
      return [];
    }
  }

  async buildWorkData(article, source) {
    const publishedDate = new Date(); // Use current date since we don't have exact publish dates from scraping
    const industry = this.getRandomIndustry(source.industry);

    // Generate unique SN
    const sn = this.generateSN(source.url, publishedDate);

    const workData = {
      sn: sn,
      publication_name: this.extractDomain(source.url).replace('www.', '').toUpperCase(),
      publication_website: source.url,
      article_link: article.url,
      article_year: publishedDate.getFullYear(),
      article_date: publishedDate.toISOString().split('T')[0], // YYYY-MM-DD format
      company_name: this.getRandomCompany(industry),
      person_name: this.getRandomPerson(),
      industry: industry,
      company_country: countryMapping[source.region] || 'United States',
      individual_country: countryMapping[source.region] || 'United States',
      description: article.title,
      tags: JSON.stringify(this.generateTags(article, industry)),
      is_featured: Math.random() < 0.1, // 10% featured
      is_active: true
    };

    return workData;
  }

  async savePublishedWork(workData) {
    // Check if work already exists by article_link
    const existing = await this.findWorkByLink(workData.article_link);
    if (existing) {
      console.log(`Work with link ${workData.article_link} already exists, skipping...`);
      return;
    }

    await PublishedWork.create(workData);
  }

  async findWorkByLink(link) {
    try {
      const sql = 'SELECT * FROM published_works WHERE article_link = $1';
      const result = await require('./src/config/database').query(sql, [link]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing work:', error);
      return null;
    }
  }

  generateSN(sourceUrl, date) {
    const domain = this.extractDomain(sourceUrl).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${domain}-${dateStr}-${random}`;
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  getRandomIndustry(industry) {
    const industries = industryMapping[industry] || industryMapping['General'];
    return industries[Math.floor(Math.random() * industries.length)];
  }

  getRandomCompany(industry) {
    const companies = companyNames[industry] || companyNames['General'];
    return companies[Math.floor(Math.random() * companies.length)];
  }

  getRandomPerson() {
    return personNames[Math.floor(Math.random() * personNames.length)];
  }

  generateTags(article, industry) {
    const baseTags = [industry.toLowerCase(), 'news', 'article'];
    if (article.title) {
      const words = article.title.toLowerCase().split(' ').filter(word => word.length > 3 && !['that', 'this', 'with', 'from', 'they', 'have', 'been', 'were', 'will', 'their', 'said', 'after', 'first', 'could', 'would', 'there', 'what', 'when', 'where', 'which', 'while', 'these', 'those', 'then', 'than', 'them'].includes(word));
      baseTags.push(...words.slice(0, 3));
    }
    return [...new Set(baseTags)]; // Remove duplicates
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();
  const populator = new PublishedWorksPopulator();
  populator.populatePublishedWorks()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = PublishedWorksPopulator;