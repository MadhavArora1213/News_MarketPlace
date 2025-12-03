const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const PowerlistNomination = require('./src/models/PowerlistNomination');

// Common logo URLs for major publications
const LOGO_URLS = {
  'Forbes Middle East': 'https://cdn.forbes.com/mx/media/images/3/4/0/f0fc0b0c1e0d8d5b9b0f1c2d3e4f5a6b.png',
  'Harper\'s Bazaar Arabia': 'https://static.harpersbazaararabia.com/harpers-bazaar-arabia-logo.png',
  'Vogue Arabia': 'https://static.vogue.me/images/vogue-arabia-logo.png',
  'GQ Middle East': 'https://static.gq.com/media/gq-middle-east-logo.png',
  'Marie Claire Arabia': 'https://static.marieclaire.me/images/marie-claire-arabia-logo.png',
  'Emirates Woman': 'https://static.emirateswoman.com/emirates-woman-logo.png',
  'Esquire Middle East': 'https://static.esquire.me/images/esquire-middle-east-logo.png',
  'Ahlan Dubai': 'https://static.ahlanlive.com/ahlan-dubai-logo.png',
  'Fact Magazine': 'https://static.factmag.ae/images/fact-magazine-logo.png',
  'Timeout Dubai': 'https://static.timeoutdubai.com/timeout-dubai-logo.png',
  'Economy Middle East': 'https://static.economymiddleeast.com/economy-middle-east-logo.png',
  'Finance Middle East': 'https://static.financemiddleeast.com/finance-middle-east-logo.png',
  'Campaign Middle East': 'https://static.campaignme.com/campaign-me-logo.png',
  'CEO Middle East': 'https://static.ceomiddleeast.com/ceo-middle-east-logo.png',
  'Retail ME': 'https://static.retailme.com/retail-me-logo.png',
  'Construction Week Online': 'https://static.constructionweekonline.com/cw-online-logo.png',
  'Hotelier Middle East': 'https://static.hoteliermiddleeast.com/hotelier-me-logo.png',
  'Law Middle East': 'https://static.law-middle-east.com/law-me-logo.png',
  'Healthcare Middle East': 'https://static.healthcaremiddleeast.com/healthcare-me-logo.png',
  'MEP Middle East': 'https://static.mepmiddleeast.com/mep-me-logo.png',
  'Facilities Management Middle East': 'https://static.fmme.ae/fm-me-logo.png',
  'Transport & Logistics ME': 'https://static.transportlogisticsme.com/transport-me-logo.png',
  'Infrastructure Middle East': 'https://static.infrastructureme.com/infrastructure-me-logo.png',
  'Security Middle East': 'https://static.securitymiddleeast.com/security-me-logo.png',
  'AD Middle East': 'https://static.admiddleeast.com/ad-me-logo.png',
  'Entrepreneur Middle East': 'https://static.entrepreneur.com/images/entrepreneur-me-logo.png',
  'Oil & Gas Middle East': 'https://static.oilandgasmiddleeast.com/oil-gas-me-logo.png',
  'Middle East Architect': 'https://static.middleeastarchitect.com/me-architect-logo.png'
};

class PowerlistNominationPopulator {
  constructor() {
    this.browser = null;
    this.uploadDir = path.join(process.cwd(), 'uploads', 'powerlist-nominations');
    this.imageDownloadsDir = path.join(process.cwd(), 'uploads', 'powerlist-nominations', 'logos');
    this.ensureUploadDirs();
  }

  ensureUploadDirs() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    if (!fs.existsSync(this.imageDownloadsDir)) {
      fs.mkdirSync(this.imageDownloadsDir, { recursive: true });
    }
  }

  async downloadLogo(publicationName, websiteUrl) {
    try {
      // First try predefined logo URLs
      const predefinedUrl = LOGO_URLS[publicationName];
      if (predefinedUrl) {
        try {
          const logoPath = await this.downloadImage(predefinedUrl, publicationName, 'logo');
          if (logoPath) {
            return logoPath;
          }
        } catch (error) {
          console.log(`Failed to download predefined logo for ${publicationName}:`, error.message);
        }
      }

      // If predefined fails, try to scrape the website for logo
      return await this.scrapeLogoFromWebsite(websiteUrl, publicationName);
    } catch (error) {
      console.error(`Error downloading logo for ${publicationName}:`, error.message);
      return null;
    }
  }

  async scrapeLogoFromWebsite(websiteUrl, publicationName) {
    try {
      const page = await this.browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });
      
      await page.goto(websiteUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Common logo selectors
      const logoSelectors = [
        'img[alt*="logo"]',
        'img[src*="logo"]',
        '.logo img',
        'header img',
        'nav img',
        'a[href="/"] img',
        '.brand img',
        'h1 img',
        'img[class*="logo"]',
        'img[id*="logo"]'
      ];

      for (const selector of logoSelectors) {
        const logoElement = await page.$(selector);
        if (logoElement) {
          const src = await page.evaluate(el => el.src || el.getAttribute('src'), logoElement);
          const alt = await page.evaluate(el => el.alt || el.getAttribute('alt'), logoElement);
          
          if (src && (alt && alt.toLowerCase().includes('logo') || src.toLowerCase().includes('logo'))) {
            // Try to get absolute URL
            let fullUrl = src;
            if (src.startsWith('//')) {
              fullUrl = 'https:' + src;
            } else if (src.startsWith('/')) {
              const url = new URL(websiteUrl);
              fullUrl = url.origin + src;
            } else if (!src.startsWith('http')) {
              fullUrl = websiteUrl + src;
            }

            const logoPath = await this.downloadImage(fullUrl, publicationName, 'logo');
            if (logoPath) {
              await page.close();
              return logoPath;
            }
          }
        }
      }

      await page.close();
      return null;
    } catch (error) {
      console.error(`Error scraping logo from ${websiteUrl}:`, error.message);
      return null;
    }
  }

  async downloadImage(imageUrl, publicationName, type = 'image') {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        return null;
      }

      // Generate filename from publication name
      const sanitizedName = publicationName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const extension = contentType.split('/')[1] || 'png';
      const filename = `${type}_${sanitizedName}_${Date.now()}.${extension}`;
      const filepath = path.join(this.imageDownloadsDir, filename);

      fs.writeFileSync(filepath, response.data);

      // Return relative path for database storage
      return `uploads/powerlist-nominations/logos/${filename}`;

    } catch (error) {
      console.error(`Error downloading image ${imageUrl}:`, error.message);
      return null;
    }
  }

  async populatePowerlistNominations() {
    try {
      console.log('Starting powerlist nominations population...');
      
      // Initialize browser
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      // Read the powerlist nominations JSON file
      const jsonFilePath = path.join(__dirname, 'data', 'powerlist-nominations-2025-12-03T14-12-45-249477.json');
      const rawData = fs.readFileSync(jsonFilePath, 'utf8');
      const data = JSON.parse(rawData);
      
      let successCount = 0;
      let errorCount = 0;
      let imageDownloadCount = 0;

      for (const nomination of data.nominations) {
        try {
          let imagePath = nomination.image;

          // Download image if missing
          if (!imagePath || imagePath.trim() === '') {
            console.log(`Downloading image for ${nomination.publication_name}...`);
            imagePath = await this.downloadLogo(nomination.publication_name, nomination.website_url);
            if (imagePath) {
              imageDownloadCount++;
              console.log(`Downloaded image: ${imagePath}`);
            }
          }

          // Prepare nomination data
          const nominationData = {
            publication_name: nomination.publication_name,
            website_url: nomination.website_url,
            power_list_name: nomination.power_list_name,
            industry: nomination.industry,
            company_or_individual: nomination.company_or_individual,
            tentative_month: nomination.tentative_month,
            location_region: nomination.location_region,
            last_power_list_url: nomination.last_power_list_url,
            image: imagePath || null,
            status: nomination.status || 'pending',
            is_active: nomination.is_active !== undefined ? nomination.is_active : true,
            description: nomination.description || '',
            created_at: nomination.created_at,
            updated_at: nomination.updated_at
          };

          // Create nomination in database
          const powerlistNomination = await PowerlistNomination.create(nominationData);
          successCount++;
          console.log(`Created nomination: ${powerlistNomination.publication_name}`);

        } catch (error) {
          console.error(`Error processing nomination ${nomination.publication_name}:`, error.message);
          errorCount++;
        }
      }

      // Close browser
      if (this.browser) {
        await this.browser.close();
      }

      console.log(`\nPopulation completed!`);
      console.log(`Total processed: ${data.nominations.length}`);
      console.log(`Successful: ${successCount}`);
      console.log(`Errors: ${errorCount}`);
      console.log(`Images downloaded: ${imageDownloadCount}`);

    } catch (error) {
      console.error('Error in populatePowerlistNominations:', error);
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();
  const populator = new PowerlistNominationPopulator();
  populator.populatePowerlistNominations()
    .then(() => {
      console.log('Powerlist nominations population completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Powerlist nominations population failed:', error);
      process.exit(1);
    });
}

module.exports = PowerlistNominationPopulator;