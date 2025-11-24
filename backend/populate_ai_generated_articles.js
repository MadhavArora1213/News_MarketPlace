const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AiGeneratedArticle = require('./src/models/AiGeneratedArticle');
const Publication = require('./src/models/Publication');

// List of sources to scrape company and person information
const SCRAPE_SOURCES = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com',
    type: 'tech_companies',
    selectors: {
      articles: 'a[href*="/202"], .post-block__title a',
      title: 'h1, .article__title',
      content: '.article-content p, .entry-content p',
      author: '.article__byline, .byline__name'
    }
  },
  {
    name: 'Crunchbase',
    url: 'https://news.crunchbase.com',
    type: 'companies',
    selectors: {
      articles: 'a[href*="/article/"]',
      title: 'h1',
      content: '.article-content p',
      author: '.author-name'
    }
  },
  {
    name: 'Forbes',
    url: 'https://www.forbes.com',
    type: 'business_people',
    selectors: {
      articles: 'a[href*="/profile/"], a[href*="/sites/"]',
      title: 'h1',
      content: '.article-body p, .entry-content p',
      author: '.contributor-name, .byline-name'
    }
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com',
    type: 'professionals',
    selectors: {
      profiles: '.entity-result__title-text a, .discovery-result__name a',
      name: '.text-heading-xlarge, .pv-text-details__left-panel h1',
      title: '.text-body-medium, .pv-text-details__left-panel .text-body-small',
      company: '.pv-entity__secondary-title, .pv-text-details__right-panel .text-body-small'
    }
  }
];

// Story types for variety
const STORY_TYPES = ['profile', 'editorial', 'advertorial', 'listicle'];

class AiGeneratedArticlePopulator {
  constructor() {
    this.browser = null;
    this.aiService = null;
  }

  getAiService() {
    if (!this.aiService) {
      try {
        this.aiService = require('./src/services/aiService');
      } catch (error) {
        console.warn('AI service not available, will use mock content generation');
        this.aiService = null;
      }
    }
    return this.aiService;
  }

  async populateAiGeneratedArticles() {
    try {
      console.log('Starting AI Generated Articles population from web scraping...');

      // Get all publications for random selection
      const publications = await this.getAllPublications();
      if (publications.length === 0) {
        console.error('No publications found. Please run populate_publications.js first.');
        return;
      }

      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      let successCount = 0;
      let errorCount = 0;

      for (const source of SCRAPE_SOURCES) {
        try {
          console.log(`Processing source: ${source.name} (${source.url})`);
          const entities = await this.scrapeEntitiesFromSource(source);
          console.log(`Scraped ${entities.length} entities from ${source.name}`);

          for (const entity of entities) {
            try {
              // Generate questionnaire data from scraped entity
              const questionnaireData = await this.generateQuestionnaireData(entity, source);

              // Random publication and story type
              const randomPub = publications[Math.floor(Math.random() * publications.length)];
              const storyType = STORY_TYPES[Math.floor(Math.random() * STORY_TYPES.length)];

              // Generate article content using AI service or fallback
              let generatedContent;
              const aiService = this.getAiService();

              if (aiService) {
                try {
                  generatedContent = await aiService.generateArticle({
                    ...questionnaireData,
                    story_type: storyType
                  }, randomPub);
                } catch (error) {
                  console.warn(`AI service failed, using mock generation: ${error.message}`);
                  generatedContent = this.generateMockArticleContent(questionnaireData, storyType, randomPub);
                }
              } else {
                generatedContent = this.generateMockArticleContent(questionnaireData, storyType, randomPub);
              }

              // Create the article record
              const articleData = {
                story_type: storyType,
                publication_id: randomPub.id,
                user_id: null, // No user for populated data
                status: 'approved', // Auto-approve populated articles
                generated_content: generatedContent
              };

              const article = new AiGeneratedArticle(articleData);
              article.setQuestionnaireData(questionnaireData);

              const savedArticle = await article.save();
              successCount++;
              console.log(`Saved AI article: ${questionnaireData.name} (${storyType})`);

            } catch (error) {
              console.error(`Error processing entity ${entity.name || 'unknown'}:`, error.message);
              errorCount++;
            }
          }
        } catch (error) {
          console.error(`Error processing source ${source.name}:`, error.message);
          errorCount++;
        }

        // Add delay between sources to avoid rate limiting
        await this.delay(3000);
      }

      if (this.browser) {
        await this.browser.close();
      }

      console.log(`Population complete. Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error('Error in populateAiGeneratedArticles:', error);
      if (this.browser) {
        await this.browser.close();
      }
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

  async scrapeEntitiesFromSource(source) {
    try {
      const page = await this.browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });

      // Handle LinkedIn differently due to login requirements
      if (source.name === 'LinkedIn') {
        return await this.scrapeLinkedInProfiles(page);
      }

      await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 30000 });

      const content = await page.content();
      const $ = cheerio.load(content);

      const entities = [];

      // Different scraping strategies based on source type
      if (source.type === 'tech_companies') {
        entities.push(...await this.scrapeTechCompanies($, source));
      } else if (source.type === 'companies') {
        entities.push(...await this.scrapeCompanies($, source));
      } else if (source.type === 'business_people') {
        entities.push(...await this.scrapeBusinessPeople($, source));
      }

      await page.close();
      return entities.slice(0, 3); // Limit to 3 entities per source

    } catch (error) {
      console.error(`Error scraping entities from ${source.name}:`, error.message);
      return [];
    }
  }

  async scrapeTechCompanies($, source) {
    const entities = [];

    // Look for company mentions in recent articles
    const articles = [];
    $(source.selectors.articles).each((i, element) => {
      if (articles.length >= 5) return false;
      const $link = $(element);
      const href = $link.attr('href');
      const title = $link.text().trim();

      if (href && title && title.length > 10) {
        let fullUrl = href.startsWith('http') ? href : source.url + href;
        articles.push({ title, url: fullUrl });
      }
    });

    // Extract company names from article titles and content
    for (const article of articles.slice(0, 3)) {
      try {
        const companies = this.extractCompanyNamesFromText(article.title);
        for (const companyName of companies) {
          if (!entities.find(e => e.name === companyName)) {
            entities.push({
              name: companyName,
              type: 'company',
              source: source.name,
              reference_url: article.url,
              industry: 'Technology'
            });
          }
        }
      } catch (error) {
        console.error(`Error extracting companies from article:`, error.message);
      }
    }

    return entities;
  }

  async scrapeCompanies($, source) {
    const entities = [];

    $(source.selectors.articles).each((i, element) => {
      if (entities.length >= 3) return false;

      const $link = $(element);
      const href = $link.attr('href');
      const title = $link.text().trim();

      if (href && title) {
        const companies = this.extractCompanyNamesFromText(title);
        for (const companyName of companies) {
          entities.push({
            name: companyName,
            type: 'company',
            source: source.name,
            reference_url: href.startsWith('http') ? href : source.url + href,
            industry: this.guessIndustryFromTitle(title)
          });
        }
      }
    });

    return entities;
  }

  async scrapeBusinessPeople($, source) {
    const entities = [];

    $(source.selectors.articles).each((i, element) => {
      if (entities.length >= 3) return false;

      const $link = $(element);
      const href = $link.attr('href');
      const title = $link.text().trim();

      if (href && title) {
        // Look for profile-style URLs
        if (href.includes('/profile/') || href.includes('/sites/')) {
          const personName = this.extractPersonNameFromTitle(title);
          if (personName) {
            entities.push({
              name: personName,
              type: 'person',
              source: source.name,
              reference_url: href.startsWith('http') ? href : source.url + href,
              industry: this.guessIndustryFromTitle(title)
            });
          }
        }
      }
    });

    return entities;
  }

  async scrapeLinkedInProfiles(page) {
    // For LinkedIn, we'll use a simpler approach and create mock profiles
    // In a real implementation, you'd need proper LinkedIn scraping or API access
    const mockProfiles = [
      {
        name: 'Sarah Johnson',
        type: 'person',
        source: 'LinkedIn',
        industry: 'Technology',
        title: 'Chief Technology Officer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA'
      },
      {
        name: 'Michael Chen',
        type: 'person',
        source: 'LinkedIn',
        industry: 'Finance',
        title: 'Investment Director',
        company: 'Global Investments LLC',
        location: 'New York, NY'
      },
      {
        name: 'Emily Rodriguez',
        type: 'person',
        source: 'LinkedIn',
        industry: 'Healthcare',
        title: 'Medical Director',
        company: 'HealthFirst Medical Group',
        location: 'Chicago, IL'
      }
    ];

    return mockProfiles;
  }

  extractCompanyNamesFromText(text) {
    // Simple regex to extract potential company names
    const companyPatterns = [
      /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g, // Title case words
      /\b[A-Z]{2,}\b/g // All caps abbreviations
    ];

    const companies = new Set();

    for (const pattern of companyPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 2 && match.length < 50) {
            companies.add(match);
          }
        });
      }
    }

    // Filter out common non-company words
    const excludeWords = ['The', 'And', 'For', 'Are', 'But', 'Not', 'You', 'All', 'Can', 'Her', 'Was', 'One', 'Our', 'Had', 'By', 'What', 'Why', 'Who', 'When', 'How'];
    return Array.from(companies).filter(company =>
      !excludeWords.includes(company) &&
      !company.match(/^(The|A|An|And|Or|But|If|Then|Else|For|To|From|With|By|At|In|On|Of)$/i)
    );
  }

  extractPersonNameFromTitle(title) {
    // Extract potential person names from titles
    const namePatterns = [
      /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, // First Last
      /\b[A-Z][a-z]+\s+[A-Z]\.\s*[A-Z][a-z]+\b/g // First M. Last
    ];

    for (const pattern of namePatterns) {
      const matches = title.match(pattern);
      if (matches) {
        return matches[0]; // Return first match
      }
    }

    return null;
  }

  guessIndustryFromTitle(title) {
    const industries = {
      'tech': ['tech', 'software', 'digital', 'app', 'platform', 'ai', 'data'],
      'finance': ['bank', 'finance', 'investment', 'capital', 'wealth'],
      'healthcare': ['health', 'medical', 'pharma', 'biotech', 'clinic'],
      'retail': ['retail', 'ecommerce', 'shopping', 'store', 'brand'],
      'energy': ['energy', 'oil', 'gas', 'renewable', 'solar'],
      'automotive': ['auto', 'car', 'vehicle', 'transport']
    };

    const lowerTitle = title.toLowerCase();

    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => lowerTitle.includes(keyword))) {
        return industry.charAt(0).toUpperCase() + industry.slice(1);
      }
    }

    return 'Business'; // Default
  }

  async generateQuestionnaireData(entity, source) {
    const questionnaireData = {
      name: entity.name,
      person_name: entity.type === 'person' ? entity.name : null,
      company_name: entity.type === 'company' ? entity.name : null,
      geo_location: entity.location || this.generateRandomLocation(),
      social_links: this.generateSocialLinks(entity),
      reference_links: entity.reference_url || null,
      seo_keywords: this.generateSEOKeywords(entity),
      tone: 'professional'
    };

    // Generate content based on entity type
    if (entity.type === 'company') {
      questionnaireData.preferred_title = `${entity.name} - ${entity.industry} Innovation Leader`;
      questionnaireData.background = `Founded with a vision to revolutionize the ${entity.industry.toLowerCase()} industry, ${entity.name} has emerged as a key player in delivering innovative solutions. The company's journey began with a focus on addressing critical market needs and has evolved into a comprehensive platform serving diverse customer segments.`;
      questionnaireData.inspiration = `Driven by the need to solve real-world problems in ${entity.industry.toLowerCase()}, ${entity.name} was inspired by the potential of technology to transform traditional business models and create more efficient, accessible solutions.`;
      questionnaireData.challenges = `Like many innovative companies, ${entity.name} faced significant challenges in scaling operations, securing funding, and gaining market acceptance. Overcoming regulatory hurdles and building trust with stakeholders were key milestones in the company's development.`;
      questionnaireData.unique_perspective = `${entity.name} brings a fresh perspective to ${entity.industry.toLowerCase()} by combining deep industry expertise with cutting-edge technology, enabling more intuitive and effective solutions.`;
      questionnaireData.highlights = `Key achievements include successful product launches, strategic partnerships, and recognition from industry analysts. The company's innovative approach has been featured in leading publications and earned accolades for technological excellence.`;
      questionnaireData.anecdotes = `One notable milestone was the successful navigation of market challenges during economic uncertainty, demonstrating resilience and adaptability that strengthened the company's position.`;
      questionnaireData.aspirations = `Looking forward, ${entity.name} aims to expand globally, introduce new breakthrough products, and continue driving innovation that benefits customers and stakeholders alike.`;
      questionnaireData.additional_info = `Headquartered in ${questionnaireData.geo_location}, ${entity.name} operates with a customer-centric approach and maintains strong relationships with partners across the ${entity.industry.toLowerCase()} ecosystem.`;

      questionnaireData.goal = `To showcase ${entity.name}'s innovative solutions and industry leadership`;
      questionnaireData.audience = `Business leaders, industry professionals, and technology decision-makers in ${entity.industry.toLowerCase()}`;
      questionnaireData.message = `${entity.name} represents the future of ${entity.industry.toLowerCase()} through innovative technology and customer-focused solutions.`;
      questionnaireData.points = `Company background, key achievements, unique value proposition, future vision`;
      questionnaireData.title_ideas = `${entity.name}: Revolutionizing ${entity.industry} | ${entity.name}'s Journey to Innovation | How ${entity.name} is Transforming ${entity.industry.toLowerCase()}`;

    } else if (entity.type === 'person') {
      questionnaireData.preferred_title = `${entity.name} - ${entity.title || 'Industry Expert'}`;
      questionnaireData.background = `${entity.name} is a distinguished professional in the ${entity.industry.toLowerCase()} sector, known for expertise and leadership. With extensive experience at ${entity.company || 'leading organizations'}, ${entity.name} has made significant contributions to industry advancement and professional development.`;
      questionnaireData.inspiration = `Inspired by the transformative potential of ${entity.industry.toLowerCase()}, ${entity.name} pursued a career dedicated to excellence and innovation. Personal experiences and industry observations motivated a commitment to driving positive change.`;
      questionnaireData.challenges = `Throughout the career journey, ${entity.name} navigated complex industry challenges, from technological disruptions to market volatility. Overcoming these obstacles built resilience and deepened expertise in strategic problem-solving.`;
      questionnaireData.unique_perspective = `${entity.name} offers unique insights gained from years of hands-on experience and exposure to diverse business environments, providing valuable perspectives on industry trends and future directions.`;
      questionnaireData.highlights = `Professional highlights include leadership roles at ${entity.company || 'prominent organizations'}, successful project implementations, and recognition for contributions to ${entity.industry.toLowerCase()} advancement.`;
      questionnaireData.anecdotes = `A defining moment came when ${entity.name} led a critical initiative that transformed business operations and set new industry standards, demonstrating visionary leadership and strategic acumen.`;
      questionnaireData.aspirations = `Future aspirations include mentoring the next generation of professionals, expanding influence in ${entity.industry.toLowerCase()}, and contributing to broader industry transformation through thought leadership and innovation.`;
      questionnaireData.additional_info = `Based in ${questionnaireData.geo_location}, ${entity.name} maintains active involvement in professional communities and continues to drive meaningful impact in the ${entity.industry.toLowerCase()} sector.`;

      questionnaireData.goal = `To highlight ${entity.name}'s expertise and contributions to ${entity.industry.toLowerCase()}`;
      questionnaireData.audience = `Industry professionals, business leaders, and aspiring professionals in ${entity.industry.toLowerCase()}`;
      questionnaireData.message = `${entity.name} exemplifies excellence and innovation in ${entity.industry.toLowerCase()} through dedication and visionary leadership.`;
      questionnaireData.points = `Professional background, key achievements, industry insights, future vision`;
      questionnaireData.title_ideas = `${entity.name}: A Leader in ${entity.industry} | ${entity.name}'s Journey to Excellence | Insights from ${entity.name} on ${entity.industry.toLowerCase()} Innovation`;
    }

    return questionnaireData;
  }

  generateRandomLocation() {
    const locations = [
      'San Francisco, CA', 'New York, NY', 'London, UK', 'Singapore', 'Sydney, Australia',
      'Toronto, Canada', 'Berlin, Germany', 'Tokyo, Japan', 'Mumbai, India', 'São Paulo, Brazil',
      'Chicago, IL', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Los Angeles, CA'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  generateSocialLinks(entity) {
    const baseName = entity.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    return {
      linkedin: `https://linkedin.com/company/${baseName}`,
      twitter: `https://twitter.com/${baseName}`,
      website: entity.reference_url || `https://www.${baseName}.com`
    };
  }

  generateSEOKeywords(entity) {
    const baseKeywords = [entity.name, entity.industry];

    if (entity.type === 'company') {
      baseKeywords.push(`${entity.industry} company`, 'innovation', 'technology', 'business solutions');
    } else {
      baseKeywords.push('professional', 'expert', 'leadership', entity.title || 'specialist');
    }

    return baseKeywords.join(', ');
  }

  generateMockArticleContent(questionnaireData, storyType, publication) {
    const { name, background, message, goal, highlights, aspirations } = questionnaireData;

    let article = `# ${name}: A ${storyType} Story\n\n`;

    article += `## Introduction\n\n`;
    if (background) {
      article += `${background}\n\n`;
    } else {
      article += `This article explores the remarkable journey and achievements of ${name} in their field.\n\n`;
    }

    article += `## The Journey\n\n`;
    if (message) {
      article += `${message}\n\n`;
    } else {
      article += `The journey began with a vision to make a difference and has evolved into a story of perseverance and success.\n\n`;
    }

    article += `## Key Achievements\n\n`;
    article += `- ${goal || 'Achieved significant milestones in their field'}\n`;
    article += `- ${highlights || 'Demonstrated leadership and innovation'}\n`;
    article += `- Built strong reputation through consistent excellence\n\n`;

    article += `## Future Outlook\n\n`;
    if (aspirations) {
      article += `${aspirations}\n\n`;
    } else {
      article += `Looking ahead, ${name} continues to innovate and inspire in their industry.\n\n`;
    }

    article += `## Conclusion\n\n`;
    article += `This comprehensive ${storyType} showcases the remarkable journey and achievements of ${name}. For ${publication?.publication_name || 'the publication'}, this represents another compelling story of success and inspiration.\n\n`;

    article += `*This article was generated using AI technology for ${publication?.publication_name || 'the publication'}.*`;

    return article;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();
  const populator = new AiGeneratedArticlePopulator();
  populator.populateAiGeneratedArticles()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = AiGeneratedArticlePopulator;