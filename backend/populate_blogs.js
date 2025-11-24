const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const Blog = require('./src/models/Blog');

// List of diverse blog sources to scrape
const BLOG_SOURCES = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com',
    category: 'Technology',
    selectors: {
      articles: 'a[href*="/202"], .post-block__title a, .river--homepage .post-block__title a',
      title: 'h1, .article__title',
      content: '.article-content p, .entry-content p, .article-body p',
      author: '.article__byline, .byline__name, .article__byline a, .author-name',
      image: '.article__featured-image img, .featured-image img, .article-hero__image img',
      date: '.article__byline time, .byline__date, time[datetime]',
      tags: '.article__tags a, .tags a, .post-tags a'
    }
  },
  {
    name: 'Forbes',
    url: 'https://www.forbes.com',
    category: 'Business',
    selectors: {
      articles: 'a[href*="/sites/"], a[href*="/profile/"]',
      title: 'h1',
      content: '.article-body p, .entry-content p, .article__content p',
      author: '.contributor-name, .byline-name, .author-name',
      image: '.article-hero__image img, .featured-image img',
      date: 'time, .publish-date',
      tags: '.article-tags a, .tags a'
    }
  },
  {
    name: 'Medium',
    url: 'https://medium.com',
    category: 'Lifestyle',
    selectors: {
      articles: 'a[href*="/p/"], .postItem a[href*="/p/"]',
      title: 'h1, .graf--title',
      content: '.postArticle-content p, .section-content p',
      author: '.postMetaInline-authorLockup a, .ds-link',
      image: '.graf--figure img, .postArticle-content img',
      date: 'time, .readingTime',
      tags: '.tags a, .postTags a'
    }
  },
  {
    name: 'Harvard Business Review',
    url: 'https://hbr.org',
    category: 'Business',
    selectors: {
      articles: 'a[href*="/article/"], .stream-item a',
      title: 'h1, .article-title',
      content: '.article-content p, .stream-item-content p',
      author: '.article-author, .byline a',
      image: '.article-hero img, .stream-item-image img',
      date: '.article-date, time',
      tags: '.article-tags a, .tags a'
    }
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com',
    category: 'Technology',
    selectors: {
      articles: 'a[href*="/story/"], .summary-item a',
      title: 'h1, .content-header__title',
      content: '.article-body p, .body__inner p',
      author: '.byline__name, .author-name',
      image: '.article-hero img, .lead-image img',
      date: '.content-header__publish-date, time',
      tags: '.tags a, .article-tags a'
    }
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com',
    category: 'Technology',
    selectors: {
      articles: 'a[href*="/202"], .c-entry-box--compact a',
      title: 'h1, .c-page-title',
      content: '.c-entry-content p, .article-body p',
      author: '.c-byline__item a, .author-name',
      image: '.c-picture img, .article-hero img',
      date: 'time, .c-byline__item time',
      tags: '.c-tags a, .tags a'
    }
  },
  {
    name: 'BBC News',
    url: 'https://www.bbc.com/news',
    category: 'News',
    selectors: {
      articles: 'a[href*="/news/"], .gs-c-promo-heading a',
      title: 'h1, .story-body__h1',
      content: '.story-body p, .article-body p',
      author: '.byline-name, .author-name',
      image: '.story-body__image img, .article-hero img',
      date: 'time, .date',
      tags: '.tags a, .article-tags a'
    }
  },
  {
    name: 'National Geographic',
    url: 'https://www.nationalgeographic.com',
    category: 'Science',
    selectors: {
      articles: 'a[href*="/article/"], .Card__Link',
      title: 'h1, .Article__Title',
      content: '.Article__Content p, .article-body p',
      author: '.Byline__Author, .author-name',
      image: '.Article__Hero img, .hero-image img',
      date: '.Byline__Date, time',
      tags: '.Article__Tags a, .tags a'
    }
  }
];

class BlogPopulator {
  constructor() {
    this.browser = null;
    this.uploadDir = path.join(__dirname, 'uploads', 'blogs');
    this.ensureUploadDir();
  }

  ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async populateBlogs() {
    try {
      console.log('Starting blog population from web scraping...');

      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      let successCount = 0;
      let errorCount = 0;

      for (const source of BLOG_SOURCES) {
        try {
          console.log(`Processing source: ${source.name} (${source.url})`);
          const articles = await this.scrapeArticlesFromSource(source);
          console.log(`Scraped ${articles.length} articles from ${source.name}`);

          for (const article of articles) {
            try {
              const blogData = await this.processArticle(article, source);
              if (blogData) {
                const blog = await Blog.create(blogData);
                successCount++;
                console.log(`Saved blog: ${blog.title}`);
              }
            } catch (error) {
              console.error(`Error processing article:`, error.message);
              errorCount++;
            }
          }
        } catch (error) {
          console.error(`Error processing source ${source.name}:`, error.message);
          errorCount++;
        }

        // Add delay between sources to avoid rate limiting
        await this.delay(2000);
      }

      if (this.browser) {
        await this.browser.close();
      }

      console.log(`Blog population complete. Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error('Error in populateBlogs:', error);
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async scrapeArticlesFromSource(source) {
    try {
      const page = await this.browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });

      await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 30000 });

      const content = await page.content();
      const $ = cheerio.load(content);

      const articles = [];

      $(source.selectors.articles).each((i, element) => {
        if (articles.length >= 5) return false; // Limit to 5 articles per source

        const $link = $(element);
        const href = $link.attr('href');
        const title = $link.text().trim() || $link.find('h2, h3, h4').text().trim();

        if (href && title && title.length > 10) {
          let fullUrl = href.startsWith('http') ? href : source.url + href;
          articles.push({
            title,
            url: fullUrl,
            source: source.name
          });
        }
      });

      await page.close();
      return articles;

    } catch (error) {
      console.error(`Error scraping articles from ${source.name}:`, error.message);
      return [];
    }
  }

  async processArticle(article, source) {
    try {
      const page = await this.browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });

      await page.goto(article.url, { waitUntil: 'networkidle2', timeout: 30000 });

      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract article data
      const title = $(source.selectors.title).first().text().trim() || article.title;
      const author = $(source.selectors.author).first().text().trim() || 'Unknown Author';
      const publishDate = this.extractDate($, source) || new Date().toISOString().split('T')[0];
      const imageUrl = this.extractImageUrl($, source);

      // Extract and clean content
      const rawContent = this.extractContent($, source);
      const cleanedContent = this.cleanContent(rawContent);

      // Extract tags
      const tags = this.extractTags($, source);

      // Download image if available
      let localImagePath = null;
      if (imageUrl) {
        localImagePath = await this.downloadImage(imageUrl, title);
      }

      await page.close();

      if (!title || !cleanedContent) {
        console.log(`Skipping article with insufficient content: ${title}`);
        return null;
      }

      return {
        title: title.substring(0, 255), // Limit title length
        content: cleanedContent,
        image: localImagePath || null,
        category: source.category,
        author: author.substring(0, 255), // Limit author length
        tags: tags.join(', '),
        publishDate
      };

    } catch (error) {
      console.error(`Error processing article ${article.url}:`, error.message);
      return null;
    }
  }

  extractDate($, source) {
    try {
      const dateElement = $(source.selectors.date).first();
      const dateText = dateElement.attr('datetime') || dateElement.text().trim();

      if (dateText) {
        const date = new Date(dateText);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }

      // Fallback to current date
      return new Date().toISOString().split('T')[0];
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  }

  extractImageUrl($, source) {
    try {
      const imgElement = $(source.selectors.image).first();
      const src = imgElement.attr('src') || imgElement.attr('data-src');

      if (src && src.startsWith('http')) {
        return src;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  extractContent($, source) {
    try {
      let content = '';

      $(source.selectors.content).each((i, element) => {
        const text = $(element).text().trim();
        if (text && text.length > 20) { // Only include substantial paragraphs
          content += text + '\n\n';
        }
      });

      return content;
    } catch (error) {
      return '';
    }
  }

  cleanContent(content) {
    if (!content) return '';

    return content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
      .trim()
      .substring(0, 10000); // Limit content length
  }

  extractTags($, source) {
    try {
      const tags = [];

      $(source.selectors.tags).each((i, element) => {
        const tag = $(element).text().trim().toLowerCase();
        if (tag && tag.length > 2 && !tags.includes(tag)) {
          tags.push(tag);
        }
      });

      // Add default tags if none found
      if (tags.length === 0) {
        tags.push(source.category.toLowerCase());
      }

      return tags.slice(0, 5); // Limit to 5 tags
    } catch (error) {
      return [source.category.toLowerCase()];
    }
  }

  async downloadImage(imageUrl, title) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        return null;
      }

      // Generate filename from title
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const extension = contentType.split('/')[1] || 'jpg';
      const filename = `blog_${sanitizedTitle}_${Date.now()}.${extension}`;
      const filepath = path.join(this.uploadDir, filename);

      fs.writeFileSync(filepath, response.data);

      // Return relative path for database storage
      return `uploads/blogs/${filename}`;

    } catch (error) {
      console.error(`Error downloading image ${imageUrl}:`, error.message);
      return null;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();
  const populator = new BlogPopulator();
  populator.populateBlogs()
    .then(() => {
      console.log('Blog population script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Blog population script failed:', error);
      process.exit(1);
    });
}

module.exports = BlogPopulator;