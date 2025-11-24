const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const Agency = require('./src/models/Agency');

// Agency sources from various directories
const agencySources = [
  {
    url: 'https://clutch.co/agencies/digital-marketing',
    category: 'Digital Marketing',
    region: 'Global'
  },
  {
    url: 'https://clutch.co/agencies/pr',
    category: 'PR',
    region: 'Global'
  },
  {
    url: 'https://clutch.co/agencies/advertising',
    category: 'Advertising',
    region: 'Global'
  },
  {
    url: 'https://www.agencyspotter.com/agencies',
    category: 'General',
    region: 'Global'
  }
];

class AgencyPopulator {
  constructor() {
    this.processedAgencies = new Set();
  }

  async populateAgencies() {
    try {
      console.log('Starting agency population...');

      let totalSuccess = 0;
      let totalError = 0;

      for (const source of agencySources) {
        console.log(`\nProcessing ${source.category} agencies from ${source.region}...`);

        try {
          const agencies = await this.scrapeAgencies(source);
          console.log(`Found ${agencies.length} agencies from ${source.url}`);

          for (const agency of agencies) {
            try {
              // Check if already processed
              if (this.processedAgencies.has(agency.name.toLowerCase())) {
                continue;
              }

              const agencyData = await this.buildAgencyData(agency, source);
              await this.saveAgency(agencyData);

              this.processedAgencies.add(agency.name.toLowerCase());
              totalSuccess++;
              console.log(`Saved agency: ${agency.name}`);

              // Delay to avoid rate limiting
              await this.delay(2000);
            } catch (error) {
              console.error(`Error processing agency ${agency.name}:`, error.message);
              totalError++;
            }
          }
        } catch (error) {
          console.error(`Error processing source ${source.url}:`, error.message);
          totalError++;
        }

        // Longer delay between sources
        await this.delay(5000);
      }

      console.log(`\nPopulation complete. Success: ${totalSuccess}, Errors: ${totalError}`);

    } catch (error) {
      console.error('Error in populateAgencies:', error);
    }
  }

  async scrapeAgencies(source) {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 60000 });

      const content = await page.content();
      const $ = cheerio.load(content);

      const agencies = [];

      // Scrape from Clutch
      if (source.url.includes('clutch.co')) {
        $('.provider-row').each((index, element) => {
          const $row = $(element);
          const name = $row.find('.company-name').text().trim();
          const website = $row.find('a[href*="http"]').first().attr('href');
          const location = $row.find('.location').text().trim();

          if (name && name.length > 2) {
            agencies.push({
              name: name,
              website: website,
              location: location,
              category: source.category,
              region: source.region
            });
          }
        });
      }

      // Scrape from Agency Spotter
      if (source.url.includes('agencyspotter.com')) {
        $('.agency-card, .agency-item').each((index, element) => {
          const $card = $(element);
          const name = $card.find('h3, .name').text().trim();
          const website = $card.find('a[href*="http"]').first().attr('href');
          const description = $card.find('.description, p').text().trim();

          if (name && name.length > 2) {
            agencies.push({
              name: name,
              website: website,
              description: description,
              category: source.category,
              region: source.region
            });
          }
        });
      }

      await browser.close();
      return agencies.slice(0, 15); // Limit per source

    } catch (error) {
      console.error(`Error scraping ${source.url}:`, error.message);
      return [];
    }
  }

  async buildAgencyData(agency, source) {
    let website = agency.website;
    let socialLinks = {};
    let description = agency.description || '';
    let ownerName = '';
    let foundedYear = null;
    let address = agency.location || '';
    let email = '';
    let contact = '';

    // If we have a website, scrape additional details
    if (website && website.includes('http')) {
      try {
        const details = await this.scrapeAgencyWebsite(website);
        socialLinks = details.socialLinks;
        description = details.description || description;
        ownerName = details.ownerName;
        foundedYear = details.foundedYear;
        address = details.address || address;
        email = details.email;
        contact = details.contact;
      } catch (error) {
        console.error(`Error scraping details for ${website}:`, error.message);
      }
    }

    // Generate random data for missing fields
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Lisa'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    const nationalities = ['American', 'British', 'Canadian', 'Australian', 'Indian', 'German', 'French', 'Italian'];

    if (!ownerName) {
      ownerName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }

    if (!foundedYear) {
      foundedYear = Math.floor(Math.random() * 30) + 1990; // Random year between 1990-2020
    }

    if (!email) {
      email = `contact@${agency.name.toLowerCase().replace(/\s+/g, '')}.com`;
    }

    if (!contact) {
      contact = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    }

    return {
      agency_name: agency.name,
      agency_legal_entity_name: `${agency.name} LLC`,
      agency_website: website,
      agency_ig: socialLinks.instagram,
      agency_linkedin: socialLinks.linkedin,
      agency_facebook: socialLinks.facebook,
      agency_address: address,
      agency_owner_name: ownerName,
      agency_owner_linkedin: socialLinks.owner_linkedin,
      agency_founded_year: foundedYear,
      agency_owner_passport_nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
      agency_email: email,
      agency_contact_number: contact,
      agency_owner_email: `owner@${agency.name.toLowerCase().replace(/\s+/g, '')}.com`,
      agency_owner_contact_number: contact,
      agency_owner_whatsapp_number: contact,
      status: 'approved',
      how_did_you_hear_about_us: 'Online directory',
      any_to_say: description
    };
  }

  async scrapeAgencyWebsite(website) {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.goto(website, { waitUntil: 'networkidle2', timeout: 30000 });

      const content = await page.content();
      const $ = cheerio.load(content);

      const socialLinks = {};

      // Scrape social media links
      const selectors = {
        linkedin: ['a[href*="linkedin.com"]', '[href*="linkedin.com"]'],
        instagram: ['a[href*="instagram.com"]', '[href*="instagram.com"]'],
        facebook: ['a[href*="facebook.com"]', '[href*="fb.com"]'],
        twitter: ['a[href*="twitter.com"]', 'a[href*="x.com"]']
      };

      for (const [platform, platformSelectors] of Object.entries(selectors)) {
        for (const selector of platformSelectors) {
          const element = $(selector).first();
          let link = element.attr('href');

          if (link) {
            if (!link.startsWith('http')) {
              link = link.startsWith('//') ? 'https:' + link : 'https://' + link.replace(/^\/\//, '');
            }
            socialLinks[platform] = link;
            break;
          }
        }
      }

      // Extract description
      let description = '';
      const descSelectors = ['meta[name="description"]', '.description', '.about', 'p:first-of-type'];
      for (const selector of descSelectors) {
        const text = $(selector).first().attr('content') || $(selector).first().text().trim();
        if (text && text.length > 50) {
          description = text.substring(0, 500);
          break;
        }
      }

      // Look for founder/owner name
      let ownerName = '';
      const ownerSelectors = ['.founder', '.owner', '.ceo', '.president'];
      for (const selector of ownerSelectors) {
        const text = $(selector).first().text().trim();
        if (text && text.length > 5) {
          ownerName = text;
          break;
        }
      }

      // Look for founded year
      let foundedYear = null;
      const bodyText = $('body').text().toLowerCase();
      const yearMatch = bodyText.match(/founded in (\d{4})|established in (\d{4})|since (\d{4})/i);
      if (yearMatch) {
        foundedYear = parseInt(yearMatch[1] || yearMatch[2] || yearMatch[3]);
      }

      // Look for address
      let address = '';
      const addressSelectors = ['.address', '.location', '.contact-address'];
      for (const selector of addressSelectors) {
        const text = $(selector).first().text().trim();
        if (text && text.length > 10) {
          address = text;
          break;
        }
      }

      // Look for email
      let email = '';
      const emailMatch = content.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      if (emailMatch) {
        email = emailMatch[0];
      }

      // Look for phone
      let contact = '';
      const phoneMatch = content.match(/\+?[\d\s\-\(\)]{10,}/);
      if (phoneMatch) {
        contact = phoneMatch[0].trim();
      }

      await browser.close();

      return {
        socialLinks,
        description,
        ownerName,
        foundedYear,
        address,
        email,
        contact
      };

    } catch (error) {
      console.error(`Error scraping website ${website}:`, error.message);
      return {
        socialLinks: {},
        description: '',
        ownerName: '',
        foundedYear: null,
        address: '',
        email: '',
        contact: ''
      };
    }
  }

  async saveAgency(agencyData) {
    // Check if agency already exists
    const existing = await this.findAgencyByName(agencyData.agency_name);
    if (existing) {
      console.log(`Agency ${agencyData.agency_name} already exists, skipping...`);
      return;
    }

    await Agency.create(agencyData);
  }

  async findAgencyByName(name) {
    try {
      const sql = 'SELECT * FROM agencies WHERE agency_name = $1';
      const result = await require('./src/config/database').query(sql, [name]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing agency:', error);
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
  const populator = new AgencyPopulator();
  populator.populateAgencies()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = AgencyPopulator;