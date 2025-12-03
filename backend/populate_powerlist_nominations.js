const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Enhanced power list sources - 35+ nominations
const powerListSources = [
  {
    publication_name: 'Forbes Middle East',
    website_url: 'https://www.forbesmiddleeast.com/list/',
    power_list_name: 'Forbes Middle East Power List',
    industry: 'Business',
    company_or_individual: 'Individual',
    tentative_month: 'December',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.forbesmiddleeast.com/list/',
    image: ''
  },
  {
    publication_name: 'Entrepreneur Middle East',
    website_url: 'https://www.entrepreneur.com/en-ae/leadership/the-2024-power-100-a-definitive-guide-to-success/484613',
    power_list_name: 'The 2024 Power 100: A Definitive Guide to Success',
    industry: 'Business',
    company_or_individual: 'Individual',
    tentative_month: 'December',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.entrepreneur.com/en-ae/leadership/the-2024-power-100-a-definitive-guide-to-success/484613',
    image: ''
  },
  {
    publication_name: 'Arabian Business',
    website_url: 'https://www.arabianbusiness.com/powerlists',
    power_list_name: 'Arabian Business Power Lists',
    industry: 'Business',
    company_or_individual: 'Individual',
    tentative_month: 'November',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.arabianbusiness.com/powerlists',
    image: ''
  },
  {
    publication_name: 'Gulf Business',
    website_url: 'https://gulfbusiness.com/tag/power-list/',
    power_list_name: 'Gulf Business Power List',
    industry: 'Business',
    company_or_individual: 'Individual',
    tentative_month: 'October',
    location_region: 'Gulf',
    last_power_list_url: 'https://gulfbusiness.com/tag/power-list/',
    image: ''
  },
  {
    publication_name: 'Economy Middle East',
    website_url: 'https://economymiddleeast.com/lists/',
    power_list_name: 'Economy Middle East Power Lists',
    industry: 'Finance',
    company_or_individual: 'Individual',
    tentative_month: 'September',
    location_region: 'Middle East',
    last_power_list_url: 'https://economymiddleeast.com/lists/',
    image: ''
  },
  {
    publication_name: 'Campaign Middle East',
    website_url: 'https://campaignme.com/campaign-middle-east-the-mena-power-list-2025/',
    power_list_name: 'Campaign Middle East The MENA Power List 2025',
    industry: 'Media',
    company_or_individual: 'Individual',
    tentative_month: 'January',
    location_region: 'MENA',
    last_power_list_url: 'https://campaignme.com/campaign-middle-east-the-mena-power-list-2025/',
    image: ''
  },
  {
    publication_name: 'Construction Week Online',
    website_url: 'https://www.constructionweekonline.com/power-lists',
    power_list_name: 'Construction Week Power Lists',
    industry: 'Real Estate and Construction',
    company_or_individual: 'Individual',
    tentative_month: 'March',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.constructionweekonline.com/power-lists',
    image: ''
  },
  {
    publication_name: 'Construction Business News Middle East',
    website_url: 'https://www.cbnme.com/mep-powerlist-2025/',
    power_list_name: 'MEP Powerlist 2025',
    industry: 'Real Estate and Construction',
    company_or_individual: 'Individual',
    tentative_month: 'January',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.cbnme.com/mep-powerlist-2025/',
    image: ''
  },
  {
    publication_name: 'Finance World',
    website_url: 'https://thefinanceworld.com/category/lists/',
    power_list_name: 'Finance World Power Lists',
    industry: 'Finance',
    company_or_individual: 'Individual',
    tentative_month: 'June',
    location_region: 'Global',
    last_power_list_url: 'https://thefinanceworld.com/category/lists/',
    image: ''
  },
  {
    publication_name: 'Hotelier Middle East',
    website_url: 'https://www.hoteliermiddleeast.com/executive-power-list-2025',
    power_list_name: 'Executive Power List 2025',
    industry: 'Travel & Tourism',
    company_or_individual: 'Individual',
    tentative_month: 'January',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.hoteliermiddleeast.com/executive-power-list-2025',
    image: ''
  },
  {
    publication_name: 'Hotel & Catering',
    website_url: 'https://hotelandcatering.com/',
    power_list_name: 'Hotel & Catering Power List',
    industry: 'Food & Beverage',
    company_or_individual: 'Individual',
    tentative_month: 'April',
    location_region: 'Middle East',
    last_power_list_url: 'https://hotelandcatering.com/',
    image: ''
  },
  {
    publication_name: 'Ahlan Dubai',
    website_url: 'https://www.ahlanlive.com/dubai/ahlan-hot-100-2026',
    power_list_name: 'Ahlan Hot 100 2026',
    industry: 'Media',
    company_or_individual: 'Individual',
    tentative_month: 'January',
    location_region: 'UAE',
    last_power_list_url: 'https://www.ahlanlive.com/dubai/ahlan-hot-100-2026',
    image: ''
  },
  {
    publication_name: 'Finance Middle East',
    website_url: 'https://www.financemiddleeast.com/power-lists/',
    power_list_name: 'Finance Middle East Power Lists',
    industry: 'Finance',
    company_or_individual: 'Individual',
    tentative_month: 'May',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.financemiddleeast.com/power-lists/',
    image: ''
  },
  {
    publication_name: 'Law Middle East',
    website_url: 'https://www.law-middle-east.com/gcs-in-the-gcc-power-list-2025-uae-edition/',
    power_list_name: 'GCs in the GCC Power List 2025 UAE Edition',
    industry: 'Legal',
    company_or_individual: 'Individual',
    tentative_month: 'January',
    location_region: 'GCC',
    last_power_list_url: 'https://www.law-middle-east.com/gcs-in-the-gcc-power-list-2025-uae-edition/',
    image: ''
  },
  {
    publication_name: 'Legal 500',
    website_url: 'https://www.legal500.com/gc-powerlist/?sfid=6023&_sft_powerlist=middle-east-2025',
    power_list_name: 'GC Powerlist Middle East 2025',
    industry: 'Legal',
    company_or_individual: 'Individual',
    tentative_month: 'January',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.legal500.com/gc-powerlist/?sfid=6023&_sft_powerlist=middle-east-2025',
    image: ''
  },
  // Additional 20+ sources for comprehensive coverage
  {
    publication_name: 'Whatson Dubai',
    website_url: 'https://whatson.ae/',
    power_list_name: 'Whatson Dubai Influencer List',
    industry: 'Media',
    company_or_individual: 'Individual',
    tentative_month: 'February',
    location_region: 'UAE',
    last_power_list_url: 'https://whatson.ae/',
    image: ''
  },
  {
    publication_name: 'Timeout Dubai',
    website_url: 'https://www.timeoutdubai.com/',
    power_list_name: 'Timeout Dubai Power List',
    industry: 'Media',
    company_or_individual: 'Individual',
    tentative_month: 'March',
    location_region: 'UAE',
    last_power_list_url: 'https://www.timeoutdubai.com/',
    image: ''
  },
  {
    publication_name: 'Fact Magazine',
    website_url: 'https://www.factmag.ae/',
    power_list_name: 'Fact Magazine Power List',
    industry: 'Media',
    company_or_individual: 'Individual',
    tentative_month: 'April',
    location_region: 'UAE',
    last_power_list_url: 'https://www.factmag.ae/',
    image: ''
  },
  {
    publication_name: 'CEO Middle East',
    website_url: 'https://www.ceomiddleeast.com/',
    power_list_name: 'CEO Middle East Power List',
    industry: 'Business',
    company_or_individual: 'Individual',
    tentative_month: 'July',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.ceomiddleeast.com/',
    image: ''
  },
  {
    publication_name: 'Middle East Architect',
    website_url: 'https://www.middleeastarchitect.com/',
    power_list_name: 'MEA Power List',
    industry: 'Real Estate and Construction',
    company_or_individual: 'Individual',
    tentative_month: 'August',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.middleeastarchitect.com/',
    image: ''
  },
  {
    publication_name: 'Retail ME',
    website_url: 'https://www.retailme.com/',
    power_list_name: 'Retail ME Power List',
    industry: 'Retail',
    company_or_individual: 'Individual',
    tentative_month: 'September',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.retailme.com/',
    image: ''
  },
  {
    publication_name: 'Healthcare Middle East',
    website_url: 'https://www.healthcaremiddleeast.com/',
    power_list_name: 'Healthcare Power List',
    industry: 'Healthcare',
    company_or_individual: 'Individual',
    tentative_month: 'October',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.healthcaremiddleeast.com/',
    image: ''
  },
  {
    publication_name: 'Oil & Gas Middle East',
    website_url: 'https://www.oilandgasmiddleeast.com/',
    power_list_name: 'Oil & Gas Power List',
    industry: 'Oil & Gas',
    company_or_individual: 'Individual',
    tentative_month: 'November',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.oilandgasmiddleeast.com/',
    image: ''
  },
  {
    publication_name: 'Emirates Woman',
    website_url: 'https://emirateswoman.com/',
    power_list_name: 'Emirates Woman Power List',
    industry: 'Media',
    company_or_individual: 'Individual',
    tentative_month: 'March',
    location_region: 'UAE',
    last_power_list_url: 'https://emirateswoman.com/',
    image: ''
  },
  {
    publication_name: 'Harper\'s Bazaar Arabia',
    website_url: 'https://www.harpersbazaararabia.com/',
    power_list_name: 'Bazaar Power List',
    industry: 'Fashion',
    company_or_individual: 'Individual',
    tentative_month: 'April',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.harpersbazaararabia.com/',
    image: ''
  },
  {
    publication_name: 'Vogue Arabia',
    website_url: 'https://en.vogue.me/',
    power_list_name: 'Vogue Arabia Power List',
    industry: 'Fashion',
    company_or_individual: 'Individual',
    tentative_month: 'May',
    location_region: 'Middle East',
    last_power_list_url: 'https://en.vogue.me/',
    image: ''
  },
  {
    publication_name: 'Marie Claire Arabia',
    website_url: 'https://www.marieclairearabia.com/',
    power_list_name: 'Marie Claire Power Women',
    industry: 'Fashion',
    company_or_individual: 'Individual',
    tentative_month: 'June',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.marieclairearabia.com/',
    image: ''
  },
  {
    publication_name: 'AD Middle East',
    website_url: 'https://www.admiddleeast.com/',
    power_list_name: 'AD100 Middle East',
    industry: 'Design',
    company_or_individual: 'Individual',
    tentative_month: 'July',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.admiddleeast.com/',
    image: ''
  },
  {
    publication_name: 'Esquire Middle East',
    website_url: 'https://www.esquireme.com/',
    power_list_name: 'Esquire Power List',
    industry: 'Media',
    company_or_individual: 'Individual',
    tentative_month: 'August',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.esquireme.com/',
    image: ''
  },
  {
    publication_name: 'GQ Middle East',
    website_url: 'https://www.gqmiddleeast.com/',
    power_list_name: 'GQ Men of the Year',
    industry: 'Media',
    company_or_individual: 'Individual',
    tentative_month: 'December',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.gqmiddleeast.com/',
    image: ''
  },
  {
    publication_name: 'MEP Middle East',
    website_url: 'https://www.mepmiddleeast.com/',
    power_list_name: 'MEP Power List',
    industry: 'Real Estate and Construction',
    company_or_individual: 'Individual',
    tentative_month: 'September',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.mepmiddleeast.com/',
    image: ''
  },
  {
    publication_name: 'MEED',
    website_url: 'https://www.meed.com/',
    power_list_name: 'MEED Power List',
    industry: 'Business',
    company_or_individual: 'Individual',
    tentative_month: 'October',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.meed.com/',
    image: ''
  },
  {
    publication_name: 'Infrastructure Middle East',
    website_url: 'https://www.infrastructureme.com/',
    power_list_name: 'Infrastructure Power List',
    industry: 'Real Estate and Construction',
    company_or_individual: 'Individual',
    tentative_month: 'November',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.infrastructureme.com/',
    image: ''
  },
  {
    publication_name: 'Facilities Management Middle East',
    website_url: 'https://www.fmme.ae/',
    power_list_name: 'FM Power List',
    industry: 'Real Estate and Construction',
    company_or_individual: 'Individual',
    tentative_month: 'December',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.fmme.ae/',
    image: ''
  },
  {
    publication_name: 'Security Middle East',
    website_url: 'https://www.securitymiddleeast.com/',
    power_list_name: 'Security Power List',
    industry: 'Security',
    company_or_individual: 'Individual',
    tentative_month: 'January',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.securitymiddleeast.com/',
    image: ''
  },
  {
    publication_name: 'Education Middle East',
    website_url: 'https://www.educationmiddleeast.com/',
    power_list_name: 'Education Power List',
    industry: 'Education',
    company_or_individual: 'Individual',
    tentative_month: 'February',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.educationmiddleeast.com/',
    image: ''
  },
  {
    publication_name: 'Transport & Logistics ME',
    website_url: 'https://www.transportlogisticsme.com/',
    power_list_name: 'Transport & Logistics Power List',
    industry: 'Transport & Logistics',
    company_or_individual: 'Individual',
    tentative_month: 'March',
    location_region: 'Middle East',
    last_power_list_url: 'https://www.transportlogisticsme.com/',
    image: ''
  }
];

class PowerlistNominationPopulator {
  constructor() {
    this.processedUrls = new Set();
    this.maxRetries = 3;
    this.retryDelay = 5000;
    this.jsonFallbackData = [];
  }

  async populateNominations() {
    try {
      console.log(`Starting powerlist nomination population for ${powerListSources.length} sources...`);
      console.log('💾 All data will be saved to JSON file');

      let totalSuccess = 0;
      let totalError = 0;

      for (const [index, source] of powerListSources.entries()) {
        console.log(`\nProcessing ${index + 1}/${powerListSources.length}: ${source.publication_name}...`);

        try {
          // Check if already processed
          if (this.processedUrls.has(source.website_url)) {
            console.log(`Already processed ${source.website_url}, skipping...`);
            continue;
          }

          const nominationData = await this.buildNominationDataWithRetry(source);
          await this.saveNomination(nominationData);

          this.processedUrls.add(source.website_url);
          totalSuccess++;
          console.log(`✅ Saved nomination: ${source.publication_name}`);

          // Progressive delay to avoid rate limiting
          const delay = Math.min(2000 + (index * 100), 5000);
          await this.delay(delay);
        } catch (error) {
          console.error(`❌ Error processing ${source.publication_name}:`, error.message);
          totalError++;
        }
      }

      // Save JSON data
      if (this.jsonFallbackData.length > 0) {
        await this.saveJsonFallback();
      }

      console.log(`\n🎉 Population complete. Success: ${totalSuccess}, Errors: ${totalError}`);
      console.log(`📊 Total nominations processed: ${totalSuccess + totalError}/${powerListSources.length}`);
      console.log(`\n📁 All data saved to JSON file`);

    } catch (error) {
      console.error('Fatal error in populateNominations:', error);
    }
  }

  async buildNominationDataWithRetry(source, attempt = 1) {
    try {
      return await this.buildNominationData(source);
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.log(`🔄 Retry attempt ${attempt + 1}/${this.maxRetries} for ${source.publication_name}`);
        await this.delay(this.retryDelay * attempt);
        return await this.buildNominationDataWithRetry(source, attempt + 1);
      }
      throw error;
    }
  }

  async buildNominationData(source) {
    let powerListName = source.power_list_name;
    let imageUrl = source.image;
    let scrapedData = {};

    // Always try to scrape for better data, even if we have basic info
    try {
      console.log(`🔍 Scraping enhanced data for ${source.publication_name}...`);
      scrapedData = await this.scrapeWebsiteData(source.website_url);
      
      // Use scraped data if available and better than existing
      if (!powerListName || scrapedData.title) {
        powerListName = scrapedData.title || 
                       scrapedData.powerListName || 
                       powerListName ||
                       `${source.publication_name} Power List`;
      }
      
      // Always try to get a good image
      if (scrapedData.image) {
        imageUrl = scrapedData.image;
      } else if (!imageUrl) {
        imageUrl = await this.findBestImage(source.website_url, source.publication_name);
      }
      
      console.log(`📊 Scraped results - Title: "${scrapedData.title || 'N/A'}", Image: "${imageUrl ? '✅' : '❌'}", Description: "${scrapedData.description ? '✅' : '❌'}"`);
    } catch (error) {
      console.error(`⚠️ Enhanced scraping failed for ${source.website_url}:`, error.message);
      
      // Fallback to basic logo search
      if (!imageUrl) {
        imageUrl = await this.findBestImage(source.website_url, source.publication_name);
      }
    }

    // Generate a more comprehensive description
    const description = scrapedData.description || 
                       this.generateDescription(source) ||
                       `Prestigious powerlist nominations from ${source.publication_name} recognizing influential leaders in ${source.industry}.`;

    return {
      publication_name: source.publication_name,
      website_url: source.website_url,
      power_list_name: powerListName,
      industry: source.industry,
      company_or_individual: source.company_or_individual,
      tentative_month: source.tentative_month,
      location_region: source.location_region,
      last_power_list_url: source.last_power_list_url,
      image: imageUrl, // This will now be a local path if image was successfully downloaded
      status: 'approved',
      is_active: true,
      description: description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  generateDescription(source) {
    const industryDescriptions = {
      'Business': 'recognizing outstanding business leaders and entrepreneurs',
      'Finance': 'celebrating influential figures in banking, investment, and financial services',
      'Media': 'highlighting creative professionals and media personalities',
      'Legal': 'honoring distinguished legal practitioners and law firm leaders',
      'Real Estate and Construction': 'showcasing leaders in property development and construction',
      'Healthcare': 'recognizing medical professionals and healthcare innovators',
      'Education': 'celebrating educational leaders and academic excellence',
      'Technology': 'highlighting tech innovators and digital transformation leaders',
      'Fashion': 'showcasing style icons and fashion industry leaders',
      'Travel & Tourism': 'recognizing hospitality and tourism industry leaders'
    };

    const industryDesc = industryDescriptions[source.industry] || 'recognizing influential leaders and innovators';
    
    return `${source.publication_name}'s prestigious powerlist ${industryDesc} across ${source.location_region}. ` +
           `This annual recognition celebrates ${source.company_or_individual.toLowerCase()} excellence and impact in the industry.` +
           (source.tentative_month ? ` Expected publication: ${source.tentative_month}.` : '');
  }

  async scrapeWebsiteData(url) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // Enhanced user agent and headers
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
      });

      // Set viewport for better rendering
      await page.setViewport({ width: 1366, height: 768 });

      console.log(`🔍 Scraping: ${url}`);
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Wait for content to load - Fixed deprecated method
      await new Promise(resolve => setTimeout(resolve, 3000));

      const content = await page.content();
      const $ = cheerio.load(content);

      // Enhanced title extraction
      let title = this.extractTitle($, url);
      
      // Enhanced image extraction
      let image = await this.extractBestImage($, url, page);
      
      // Extract description
      let description = this.extractDescription($);

      // Extract power list specific information
      let powerListName = this.extractPowerListName($, title);

      console.log(`📝 Extracted - Title: "${title}", Image: "${image ? '✅' : '❌'}", Description: "${description ? '✅' : '❌'}"`);

      // Download and save image if found
      let localImagePath = '';
      if (image) {
        try {
          localImagePath = await this.downloadAndSaveImage(image, title);
        } catch (imageError) {
          console.error(`🖼️ Image download failed for ${title}:`, imageError.message);
        }
      }

      return {
        title: title || '',
        powerListName: powerListName || '',
        image: localImagePath,
        description: description || '',
        logo: image || ''
      };

    } finally {
      await browser.close();
    }
  }

  extractTitle($, url) {
    // Multiple title extraction strategies
    const titleSelectors = [
      'h1.entry-title',
      'h1.post-title',
      'h1.article-title',
      'h1[class*="title"]',
      'h1',
      '.page-title',
      '.entry-header h1',
      '[class*="headline"]',
      'title'
    ];

    for (const selector of titleSelectors) {
      const element = $(selector).first();
      if (element.length) {
        let title = element.text().trim();
        if (title && title.length > 5) {
          // Clean up title
          title = title.replace(/\|.*$/, '').replace(/-.*$/, '').trim();
          if (title.length > 10) {
            return title;
          }
        }
      }
    }

    // Fallback to page title
    let title = $('title').text().trim();
    if (title) {
      title = title.split('|')[0].split('-')[0].trim();
    }

    return title || 'Power List';
  }

  async extractBestImage($, url, page) {
    // Enhanced image extraction strategies with more selectors
    const imageSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'meta[property="og:image:url"]',
      'meta[name="twitter:image:src"]',
      'link[rel="image_src"]',
      '.featured-image img',
      '.post-thumbnail img',
      '.wp-post-image',
      '.entry-content img:first-child',
      'article img:first-child',
      '.hero-image img',
      '.banner img',
      '.header-image img',
      '.logo img',
      '.site-logo img',
      '.brand-logo img',
      'header img[src*="logo"]',
      'img[class*="logo"]',
      'img[alt*="logo"]',
      'img[src*="logo"]',
      '.navbar img',
      '.navigation img'
    ];

    // Try each selector in order of preference
    for (const selector of imageSelectors) {
      const element = $(selector).first();
      let imgSrc = '';

      if (selector.includes('meta') || selector.includes('link')) {
        imgSrc = element.attr('content') || element.attr('href');
      } else {
        imgSrc = element.attr('src') || 
                 element.attr('data-src') || 
                 element.attr('data-lazy-src') ||
                 element.attr('data-original');
      }

      if (imgSrc) {
        // Convert relative URLs to absolute
        imgSrc = this.normalizeImageUrl(imgSrc, url);
        
        // Validate image URL and check if it's accessible
        if (await this.isValidAndAccessibleImage(imgSrc)) {
          console.log(`✅ Found valid image: ${imgSrc}`);
          return imgSrc;
        }
      }
    }

    // If no image found, try to find any suitable image from the page
    const allImages = $('img').toArray();
    for (const img of allImages) {
      const imgSrc = $(img).attr('src') || $(img).attr('data-src');
      if (imgSrc) {
        const normalizedSrc = this.normalizeImageUrl(imgSrc, url);
        if (await this.isValidAndAccessibleImage(normalizedSrc)) {
          console.log(`✅ Found fallback image: ${normalizedSrc}`);
          return normalizedSrc;
        }
      }
    }

    return '';
  }

  normalizeImageUrl(imgSrc, baseUrl) {
    if (imgSrc.startsWith('//')) {
      return 'https:' + imgSrc;
    } else if (imgSrc.startsWith('/')) {
      return new URL(imgSrc, baseUrl).href;
    } else if (!imgSrc.startsWith('http')) {
      return new URL(imgSrc, baseUrl).href;
    }
    return imgSrc;
  }

  async isValidAndAccessibleImage(url) {
    try {
      // Skip data URLs and blob URLs
      if (url.startsWith('data:') || url.startsWith('blob:')) {
        return false;
      }

      // Skip very small images (likely icons)
      if (url.includes('favicon') || url.includes('icon') || url.includes('sprite')) {
        return false;
      }

      const response = await axios.head(url, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
        }
      });
      
      const contentType = response.headers['content-type'] || '';
      const contentLength = parseInt(response.headers['content-length'] || '0');
      
      // Must be an image with reasonable size
      return contentType.startsWith('image/') && 
             contentLength > 2000 && // At least 2KB
             contentLength < 10000000; // Less than 10MB
    } catch (error) {
      return false;
    }
  }

  async findBestImage(websiteUrl, publicationName) {
    try {
      console.log(`🔍 Searching for logo/image for ${publicationName}...`);
      const domain = new URL(websiteUrl).hostname;
      
      // Enhanced logo URL patterns with more possibilities
      const logoUrls = [
        // WordPress common paths
        `https://${domain}/wp-content/uploads/logo.png`,
        `https://${domain}/wp-content/uploads/logo.jpg`,
        `https://${domain}/wp-content/uploads/logo.svg`,
        `https://${domain}/wp-content/themes/${domain.split('.')[0]}/images/logo.png`,
        `https://${domain}/wp-content/uploads/${new Date().getFullYear()}/logo.png`,
        
        // Common static paths
        `https://${domain}/images/logo.png`,
        `https://${domain}/images/logo.jpg`,
        `https://${domain}/images/logo.svg`,
        `https://${domain}/assets/images/logo.png`,
        `https://${domain}/assets/images/logo.jpg`,
        `https://${domain}/assets/logo.png`,
        `https://${domain}/static/images/logo.png`,
        `https://${domain}/static/logo.png`,
        `https://${domain}/media/logo.png`,
        
        // Root level
        `https://${domain}/logo.png`,
        `https://${domain}/logo.jpg`,
        `https://${domain}/logo.svg`,
        
        // Brand specific
        `https://${domain}/brand/logo.png`,
        `https://${domain}/brand/images/logo.png`,
        
        // Common CMS paths
        `https://${domain}/sites/default/files/logo.png`,
        `https://${domain}/uploads/logo.png`,
        
        // Favicon as fallback (but larger versions)
        `https://${domain}/apple-touch-icon.png`,
        `https://${domain}/apple-touch-icon-180x180.png`,
        `https://${domain}/favicon-32x32.png`,
        `https://${domain}/favicon.png`
      ];

      for (const logoUrl of logoUrls) {
        try {
          if (await this.isValidAndAccessibleImage(logoUrl)) {
            const localPath = await this.downloadAndSaveImage(logoUrl, `${publicationName}-logo`);
            console.log(`✅ Successfully found and saved logo: ${logoUrl}`);
            return localPath;
          }
        } catch (error) {
          continue;
        }
      }

      // Try to scrape the homepage for logo images
      try {
        const logoFromHomepage = await this.scrapeLogo(websiteUrl);
        if (logoFromHomepage) {
          return logoFromHomepage;
        }
      } catch (error) {
        console.error(`Error scraping homepage logo for ${publicationName}:`, error.message);
      }

      console.log(`⚠️ No logo found for ${publicationName}`);
      return '';
    } catch (error) {
      console.error(`🖼️ Logo search failed for ${publicationName}:`, error.message);
      return '';
    }
  }

  async scrapeLogo(url) {
    try {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Get page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Look for logo images specifically
      const logoSelectors = [
        'img[alt*="logo" i]',
        'img[class*="logo" i]',
        'img[src*="logo" i]',
        '.site-logo img',
        '.navbar-brand img',
        '.header-logo img',
        '.brand img',
        'header img:first-child'
      ];

      for (const selector of logoSelectors) {
        const img = $(selector).first();
        const src = img.attr('src') || img.attr('data-src');
        
        if (src) {
          const normalizedSrc = this.normalizeImageUrl(src, url);
          if (await this.isValidAndAccessibleImage(normalizedSrc)) {
            await browser.close();
            const publicationName = new URL(url).hostname.replace(/\./g, '-');
            return await this.downloadAndSaveImage(normalizedSrc, `${publicationName}-scraped-logo`);
          }
        }
      }

      await browser.close();
      return '';
    } catch (error) {
      console.error('Error scraping logo from homepage:', error.message);
      return '';
    }
  }

  async downloadAndSaveImage(imageUrl, filename) {
    try {
      console.log(`⬇️ Downloading image: ${imageUrl}`);
      
      const response = await axios.get(imageUrl, {
        timeout: 20000,
        responseType: 'arraybuffer',
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache'
        }
      });

      if (response.status === 200 && response.data && response.data.byteLength > 2000) {
        const localPath = await this.saveImageLocally(response.data, filename);
        console.log(`✅ Successfully downloaded and saved: ${localPath}`);
        return localPath;
      }

      throw new Error(`Invalid image data: ${response.data.byteLength} bytes`);
    } catch (error) {
      console.error(`📥 Image download failed for ${filename}:`, error.message);
      throw error;
    }
  }

  async saveImageLocally(imageBuffer, filename) {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, 'uploads', 'powerlist-nominations');
      await fs.promises.mkdir(uploadsDir, { recursive: true });

      // Generate unique filename with proper extension detection
      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1E9);
      
      // Detect image type from buffer
      let extension = '.jpg'; // default
      const signature = imageBuffer.slice(0, 4).toString('hex');
      
      if (signature.startsWith('89504e47')) extension = '.png';
      else if (signature.startsWith('47494638')) extension = '.gif';
      else if (signature.startsWith('ffd8ffe') || signature.startsWith('ffd8ffdb')) extension = '.jpg';
      else if (signature.startsWith('52494646')) extension = '.webp';
      
      const baseName = filename.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
      const uniqueFilename = `${baseName}-${timestamp}-${randomSuffix}${extension}`;
      const filepath = path.join(uploadsDir, uniqueFilename);

      // Optimize image before saving using Sharp
      let optimizedBuffer;
      try {
        optimizedBuffer = await sharp(imageBuffer)
          .resize(400, 300, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg({ 
            quality: 85,
            progressive: true
          })
          .toBuffer();
      } catch (sharpError) {
        // If Sharp fails, save original buffer
        console.warn('Sharp optimization failed, saving original:', sharpError.message);
        optimizedBuffer = imageBuffer;
      }

      // Save file
      await fs.promises.writeFile(filepath, optimizedBuffer);

      // Return URL path for database storage
      const publicUrl = `/uploads/powerlist-nominations/${uniqueFilename}`;
      console.log(`💾 Image saved locally: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      console.error('❌ Local image save error:', error);
      throw new Error(`Failed to save image locally: ${error.message}`);
    }
  }

  async saveNomination(nominationData) {
    try {
      // Always save to JSON array
      this.jsonFallbackData.push(nominationData);
      console.log(`📝 Added to JSON data: ${nominationData.publication_name}`);
    } catch (error) {
      console.error('JSON save error:', error.message);
      throw error;
    }
  }

  async saveJsonFallback() {
    try {
      const outputDir = path.join(__dirname, 'data');
      await fs.promises.mkdir(outputDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `powerlist-nominations-${timestamp}.json`;
      const filepath = path.join(outputDir, filename);

      const jsonData = {
        metadata: {
          generated_at: new Date().toISOString(),
          total_nominations: this.jsonFallbackData.length,
          source: 'Enhanced Powerlist Nomination Populator',
          note: 'Complete powerlist nominations data ready for import'
        },
        nominations: this.jsonFallbackData
      };

      await fs.promises.writeFile(filepath, JSON.stringify(jsonData, null, 2));
      console.log(`\n💾 JSON data saved: ${filepath}`);
      console.log(`📊 Total nominations in file: ${this.jsonFallbackData.length}`);
      
      // Create import script
      await this.createImportScript(filename);
      
    } catch (error) {
      console.error('Error saving JSON data:', error);
    }
  }

  async createImportScript(jsonFilename) {
    try {
      const importScript = `// Import script for powerlist nominations
const fs = require('fs');
const path = require('path');
const PowerlistNomination = require('./src/models/PowerlistNomination');

async function importPowerlistNominations() {
  try {
    console.log('Starting powerlist nominations import...');
    
    const jsonPath = path.join(__dirname, 'data', '${jsonFilename}');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(\`Found \${data.nominations.length} nominations to import\`);
    
    let imported = 0;
    let skipped = 0;
    
    for (const nomination of data.nominations) {
      try {
        // Check if already exists
        const existing = await PowerlistNomination.findByUrl(nomination.website_url);
        
        if (existing) {
          console.log(\`Skipping existing: \${nomination.publication_name}\`);
          skipped++;
          continue;
        }
        
        await PowerlistNomination.create(nomination);
        console.log(\`✅ Imported: \${nomination.publication_name}\`);
        imported++;
        
      } catch (error) {
        console.error(\`❌ Error importing \${nomination.publication_name}:\`, error.message);
      }
    }
    
    console.log(\`\\n🎉 Import complete!\\nImported: \${imported}\\nSkipped: \${skipped}\`);
    
  } catch (error) {
    console.error('Import failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  importPowerlistNominations()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = importPowerlistNominations;
`;

      const scriptPath = path.join(__dirname, 'import_powerlist_nominations.js');
      await fs.promises.writeFile(scriptPath, importScript);
      console.log(`📜 Import script created: ${scriptPath}`);
      console.log(`💡 Run with: node import_powerlist_nominations.js`);
      
    } catch (error) {
      console.error('Error creating import script:', error);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  extractDescription($) {
    // Multiple description extraction strategies
    const descriptionSelectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      '.entry-content p:first-child',
      '.post-content p:first-child',
      '.article-content p:first-child',
      '.content p:first-child',
      '.description',
      '.excerpt',
      '.summary'
    ];

    for (const selector of descriptionSelectors) {
      const element = $(selector).first();
      let description = '';
      
      if (selector.includes('meta')) {
        description = element.attr('content');
      } else {
        description = element.text();
      }
      
      if (description && description.trim().length > 20) {
        // Clean up description
        description = description.trim()
          .replace(/\s+/g, ' ')
          .replace(/[\r\n\t]/g, ' ')
          .substring(0, 500);
        
        if (description.length > 30) {
          return description;
        }
      }
    }

    return '';
  }

  extractPowerListName($, fallbackTitle) {
    // Look for power list specific titles
    const powerListSelectors = [
      'h1[class*="power" i]',
      'h1[class*="list" i]',
      '.power-list-title',
      '.list-title',
      '[class*="powerlist"]',
      'h1:contains("Power")',
      'h1:contains("List")'
    ];

    for (const selector of powerListSelectors) {
      const element = $(selector).first();
      if (element.length) {
        const title = element.text().trim();
        if (title && title.length > 5) {
          return title;
        }
      }
    }

    // If no specific power list title found, enhance the fallback title
    if (fallbackTitle) {
      if (fallbackTitle.toLowerCase().includes('power') || 
          fallbackTitle.toLowerCase().includes('list')) {
        return fallbackTitle;
      }
      
      // Add "Power List" if it seems relevant
      if (fallbackTitle.length > 10) {
        return fallbackTitle + ' Power List';
      }
    }

    return '';
  }
}

// Enhanced run section with better error handling
if (require.main === module) {
  require('dotenv').config();
  const populator = new PowerlistNominationPopulator();
  
  console.log('🚀 Starting Enhanced Powerlist Nomination Populator...');
  console.log(`📊 Target: ${powerListSources.length} powerlist nominations`);
  console.log(`💡 Note: Images will be saved locally, all data will be saved to JSON file`);
  
  populator.populateNominations()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      console.log('📁 Data saved to JSON file for database import.');
      console.log('💡 Use the generated import script to add data to database when ready.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = PowerlistNominationPopulator;