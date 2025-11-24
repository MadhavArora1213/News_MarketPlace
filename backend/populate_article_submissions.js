const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ArticleSubmission = require('./src/models/ArticleSubmission');
const Publication = require('./src/models/Publication');

// List of news websites to scrape articles from
const NEWS_SOURCES = [
  { url: 'https://www.cnn.com', region: 'United States', industry: 'General' },
  { url: 'https://www.bbc.com/news', region: 'United Kingdom', industry: 'General' },
  { url: 'https://www.reuters.com', region: 'Global', industry: 'Business' },
  { url: 'https://www.nytimes.com', region: 'United States', industry: 'General' },
  { url: 'https://www.theguardian.com', region: 'United Kingdom', industry: 'General' },
  { url: 'https://techcrunch.com', region: 'Global', industry: 'Technology' },
  { url: 'https://www.bloomberg.com', region: 'Global', industry: 'Business' },
  { url: 'https://www.aljazeera.com', region: 'Qatar', industry: 'General' }
];

class ArticleSubmissionPopulator {
  constructor() {
    this.uploadDir = path.join(__dirname, 'uploads', 'article-submissions');
    this.ensureUploadDir();
  }

  ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async populateArticleSubmissions() {
    try {
      console.log('Starting article submission population from web scraping...');

      // Get all publications for random selection
      const publications = await this.getAllPublications();
      if (publications.length === 0) {
        console.error('No publications found. Please run populate_publications.js first.');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const source of NEWS_SOURCES) {
        try {
          console.log(`Processing source: ${source.url}`);
          const articles = await this.scrapeArticlesFromSource(source);
          console.log(`Scraped ${articles.length} articles from ${source.url}`);

          for (const article of articles) {
            try {
              const fullArticle = await this.scrapeFullArticle(article.url);
              if (fullArticle) {
                const submissionData = await this.buildSubmissionData(fullArticle, source, publications);
                await this.saveArticleSubmission(submissionData);
                successCount++;
                console.log(`Saved article submission: ${submissionData.title}`);
              }
            } catch (error) {
              console.error(`Error processing article ${article.url}:`, error.message);
              errorCount++;
            }
          }
        } catch (error) {
          console.error(`Error processing source ${source.url}:`, error.message);
          errorCount++;
        }

        // Add delay between sources to avoid rate limiting
        await this.delay(5000);
      }

      console.log(`Population complete. Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error('Error in populateArticleSubmissions:', error);
    }
  }

  async getAllPublications() {
    try {
      const publications = await Publication.findAll();
      return publications;
    } catch (error) {
      console.error('Error fetching publications:', error);
      return [];
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
          if (articles.length >= 5) return false; // Limit to 5 articles per source

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

        if (articles.length >= 5) break;
      }

      await browser.close();
      return articles.slice(0, 5); // Limit to 5 per source

    } catch (error) {
      console.error(`Error scraping articles from ${source.url}:`, error.message);
      return [];
    }
  }

  async scrapeFullArticle(url) {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract title
      const title = $('h1').first().text().trim() ||
                   $('title').text().trim().split('|')[0].trim() ||
                   'Untitled Article';

      // Extract author
      const author = $('.author, .byline, [data-author], .author-name').first().text().trim() ||
                    $('meta[name="author"]').attr('content') ||
                    $('meta[property="article:author"]').attr('content') ||
                    'Anonymous';

      // Extract article content
      const articleText = this.extractArticleText($);

      // Extract images
      const images = this.extractImages($, url);

      await browser.close();

      if (!articleText || articleText.length < 100) {
        console.log(`Article content too short for ${url}, skipping...`);
        return null;
      }

      return {
        title,
        author,
        content: articleText,
        images,
        url
      };

    } catch (error) {
      console.error(`Error scraping full article from ${url}:`, error.message);
      return null;
    }
  }

  extractArticleText($) {
    // Common article content selectors
    const selectors = [
      '.article-body, .story-body, .content-body, .article-content',
      'article p',
      '.post-content p',
      '[data-component="text-block"] p'
    ];

    let text = '';
    for (const selector of selectors) {
      $(selector).each((i, elem) => {
        const paraText = $(elem).text().trim();
        if (paraText.length > 20) {
          text += paraText + '\n\n';
        }
      });
      if (text.length > 500) break; // Enough content
    }

    return text.trim();
  }

  extractImages($, baseUrl) {
    const images = [];
    $('article img, .article-body img, .story-body img').each((i, elem) => {
      if (images.length >= 2) return false; // Max 2 images

      const src = $(elem).attr('src') || $(elem).attr('data-src');
      if (src) {
        const fullSrc = src.startsWith('http') ? src : new URL(src, baseUrl).href;
        images.push(fullSrc);
      }
    });
    return images;
  }

  async buildSubmissionData(article, source, publications) {
    // Random publication
    const randomPub = publications[Math.floor(Math.random() * publications.length)];

    // Download images
    const imagePaths = [];
    for (let i = 0; i < Math.min(article.images.length, 2); i++) {
      try {
        const imagePath = await this.downloadImage(article.images[i]);
        if (imagePath) {
          imagePaths.push(imagePath);
        }
      } catch (error) {
        console.error(`Error downloading image ${article.images[i]}:`, error.message);
      }
    }

    const submissionData = {
      user_id: null, // No user
      publication_id: randomPub.id,
      title: article.title.substring(0, 255), // Limit title length
      sub_title: null,
      by_line: article.author.substring(0, 255),
      tentative_publish_date: this.getRandomFutureDate(),
      article_text: article.content,
      image1: imagePaths[0] || null,
      image2: imagePaths[1] || null,
      website_link: null,
      instagram_link: null,
      facebook_link: null,
      terms_agreed: true
    };

    return submissionData;
  }

  async downloadImage(imageUrl) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'stream',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        return null;
      }

      const extension = path.extname(imageUrl) || '.jpg';
      const filename = `article-submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extension}`;
      const filepath = path.join(this.uploadDir, filename);

      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filename));
        writer.on('error', reject);
      });

    } catch (error) {
      console.error(`Error downloading image ${imageUrl}:`, error.message);
      return null;
    }
  }

  async saveArticleSubmission(submissionData) {
    // Check if submission already exists by title
    const existing = await this.findSubmissionByTitle(submissionData.title);
    if (existing) {
      console.log(`Submission with title "${submissionData.title}" already exists, skipping...`);
      return;
    }

    await ArticleSubmission.create(submissionData);
  }

  async findSubmissionByTitle(title) {
    try {
      const sql = 'SELECT * FROM article_submissions WHERE title = $1';
      const result = await require('./src/config/database').query(sql, [title]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing submission:', error);
      return null;
    }
  }

  getRandomFutureDate() {
    const now = new Date();
    const future = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Up to 30 days from now
    return future.toISOString().split('T')[0];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();
  const populator = new ArticleSubmissionPopulator();
  populator.populateArticleSubmissions()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = ArticleSubmissionPopulator;