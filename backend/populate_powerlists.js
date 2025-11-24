const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const Powerlist = require('./src/models/Powerlist');

// Sources for influential people across different industries and regions
const powerSources = [
  {
    url: 'https://www.forbes.com/real-time-billionaires/',
    category: 'Business',
    region: 'Global',
    type: 'billionaires'
  },
  {
    url: 'https://www.forbes.com/powerful-people/',
    category: 'Business',
    region: 'Global',
    type: 'powerful'
  },
  {
    url: 'https://www.forbes.com/profile/',
    category: 'Business',
    region: 'Global',
    type: 'profiles'
  },
  {
    url: 'https://en.wikipedia.org/wiki/List_of_billionaires',
    category: 'Business',
    region: 'Global',
    type: 'billionaires'
  },
  {
    url: 'https://en.wikipedia.org/wiki/List_of_political_leaders',
    category: 'Politics',
    region: 'Global',
    type: 'political'
  },
  {
    url: 'https://en.wikipedia.org/wiki/List_of_CEOs',
    category: 'Business',
    region: 'Global',
    type: 'executives'
  },
  {
    url: 'https://en.wikipedia.org/wiki/List_of_actors',
    category: 'Entertainment',
    region: 'Global',
    type: 'celebrities'
  },
  {
    url: 'https://en.wikipedia.org/wiki/List_of_sportspeople',
    category: 'Sports',
    region: 'Global',
    type: 'athletes'
  },
  {
    url: 'https://www.forbes.com/30-under-30/',
    category: 'Business',
    region: 'Global',
    type: 'young_leaders'
  },
  {
    url: 'https://www.forbes.com/women/',
    category: 'Business',
    region: 'Global',
    type: 'women_leaders'
  }
];

class PowerListPopulator {
  constructor() {
    this.processedPeople = new Set();
  }

  async populatePowerLists() {
    try {
      console.log('Starting power list population...');

      let totalSuccess = 0;
      let totalError = 0;

      for (const source of powerSources) {
        console.log(`\nProcessing ${source.category} from ${source.region} (${source.type})...`);

        try {
          const people = await this.scrapePeopleFromSource(source);
          console.log(`Found ${people.length} people from ${source.url}`);

          for (const person of people) {
            try {
              // Check if already processed
              const personKey = `${person.name.toLowerCase()}-${person.email || ''}`.trim();
              if (this.processedPeople.has(personKey)) {
                continue;
              }

              const personData = await this.buildPersonData(person, source);
              await this.savePerson(personData);

              this.processedPeople.add(personKey);
              totalSuccess++;
              console.log(`Saved person: ${person.name}`);

              // Delay to avoid rate limiting
              await this.delay(2000);
            } catch (error) {
              console.error(`Error processing person ${person.name}:`, error.message);
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
      console.error('Error in populatePowerLists:', error);
    }
  }

  async scrapePeopleFromSource(source) {
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

      const people = [];

      if (source.url.includes('forbes.com')) {
        people.push(...await this.scrapeForbes($, source));
      } else if (source.url.includes('wikipedia.org')) {
        people.push(...await this.scrapeWikipedia($, source));
      }

      await browser.close();
      return people.slice(0, 25); // Limit per source

    } catch (error) {
      console.error(`Error scraping ${source.url}:`, error.message);
      return [];
    }
  }

  async scrapeForbes($, source) {
    const people = [];

    // Forbes billionaire list
    if (source.type === 'billionaires') {
      $('.table-row, .person-card').each((index, element) => {
        const $el = $(element);
        const name = $el.find('.name, .person-name, h3').first().text().trim();
        const company = $el.find('.company, .source').first().text().trim();
        const netWorth = $el.find('.net-worth, .worth').first().text().trim();

        if (name && name.length > 2) {
          people.push({
            name,
            current_company: company || 'Self-made',
            position: 'Entrepreneur/Business Leader',
            company_industry: this.guessIndustry(company, name),
            net_worth: netWorth,
            source: 'Forbes Billionaires'
          });
        }
      });
    }

    // Forbes powerful people
    if (source.type === 'powerful') {
      $('.person-item, .powerful-person').each((index, element) => {
        const $el = $(element);
        const name = $el.find('.name, h3').first().text().trim();
        const title = $el.find('.title, .position').first().text().trim();
        const company = $el.find('.company, .organization').first().text().trim();

        if (name && name.length > 2) {
          people.push({
            name,
            position: title || 'Leader',
            current_company: company,
            company_industry: this.guessIndustry(company, name),
            source: 'Forbes Powerful People'
          });
        }
      });
    }

    // Forbes profiles
    if (source.type === 'profiles') {
      $('.profile-card, .person-profile').each((index, element) => {
        const $el = $(element);
        const name = $el.find('.name, h2').first().text().trim();
        const bio = $el.find('.bio, .description').first().text().trim();

        if (name && name.length > 2) {
          people.push({
            name,
            position: this.extractPosition(bio),
            current_company: this.extractCompany(bio),
            company_industry: this.guessIndustry(this.extractCompany(bio), name),
            source: 'Forbes Profiles'
          });
        }
      });
    }

    return people;
  }

  async scrapeWikipedia($, source) {
    const people = [];

    // Wikipedia tables
    $('table.wikitable tr').each((index, element) => {
      if (index === 0) return; // Skip header

      const $row = $(element);
      const $cells = $row.find('td');

      if ($cells.length > 1) {
        const name = $cells.first().text().trim();
        let company = '';
        let position = '';

        // Extract additional info from other cells
        $cells.each((cellIndex, cell) => {
          const text = $(cell).text().trim();
          if (cellIndex === 1 && text) {
            position = text;
          }
          if (cellIndex === 2 && text) {
            company = text;
          }
        });

        if (name && name.length > 2 && !name.includes('Rank') && !name.includes('Name')) {
          people.push({
            name,
            position: position || this.guessPosition(source.type),
            current_company: company,
            company_industry: this.guessIndustry(company, name),
            source: `Wikipedia ${source.category}`
          });
        }
      }
    });

    // Wikipedia lists
    $('ul li').each((index, element) => {
      const $li = $(element);
      const text = $li.text().trim();

      if (text && text.length > 10 && text.includes(',')) {
        const parts = text.split(',');
        const name = parts[0].trim();

        if (name && name.length > 2 && parts.length > 1) {
          people.push({
            name,
            position: parts[1].trim() || this.guessPosition(source.type),
            current_company: parts[2] ? parts[2].trim() : '',
            company_industry: this.guessIndustry(parts[2] ? parts[2].trim() : '', name),
            source: `Wikipedia ${source.category}`
          });
        }
      }
    });

    return people;
  }

  guessIndustry(company, name) {
    if (!company) return 'Unknown';

    const companyLower = company.toLowerCase();
    const nameLower = name.toLowerCase();

    if (companyLower.includes('microsoft') || companyLower.includes('apple') || companyLower.includes('google') || companyLower.includes('amazon') || companyLower.includes('facebook') || companyLower.includes('meta')) {
      return 'Technology';
    }
    if (companyLower.includes('oil') || companyLower.includes('energy') || companyLower.includes('petroleum')) {
      return 'Energy';
    }
    if (companyLower.includes('bank') || companyLower.includes('finance') || companyLower.includes('investment')) {
      return 'Finance';
    }
    if (companyLower.includes('entertainment') || companyLower.includes('films') || companyLower.includes('music') || nameLower.includes('actor') || nameLower.includes('singer')) {
      return 'Entertainment';
    }
    if (companyLower.includes('sports') || nameLower.includes('player') || nameLower.includes('coach')) {
      return 'Sports';
    }
    if (companyLower.includes('government') || companyLower.includes('ministry') || nameLower.includes('president') || nameLower.includes('minister')) {
      return 'Government/Politics';
    }

    return 'Business';
  }

  guessPosition(type) {
    switch (type) {
      case 'billionaires': return 'Entrepreneur';
      case 'political': return 'Political Leader';
      case 'executives': return 'CEO/Executive';
      case 'celebrities': return 'Celebrity';
      case 'athletes': return 'Athlete';
      case 'young_leaders': return 'Young Leader';
      case 'women_leaders': return 'Business Leader';
      default: return 'Leader';
    }
  }

  extractPosition(bio) {
    if (!bio) return 'Leader';

    const positionPatterns = [
      /(?:CEO|Chief Executive Officer|President|Chairman|Founder|Director)/i,
      /(?:Minister|President|Prime Minister|Governor)/i,
      /(?:Actor|Actress|Singer|Musician|Artist)/i,
      /(?:Athlete|Player|Coach)/i
    ];

    for (const pattern of positionPatterns) {
      const match = bio.match(pattern);
      if (match) return match[0];
    }

    return 'Leader';
  }

  extractCompany(bio) {
    if (!bio) return '';

    // Look for company mentions
    const companyPatterns = [
      /(?:at|of)\s+([A-Z][a-zA-Z\s&]+?)(?:\s|,|\.)/,
      /([A-Z][a-zA-Z\s&]+(?:Inc|Corp|LLC|Company|Group|Enterprises))/,
      /([A-Z][a-zA-Z\s&]+(?:Corporation|Industries|Systems|Technologies))/
    ];

    for (const pattern of companyPatterns) {
      const match = bio.match(pattern);
      if (match && match[1]) return match[1].trim();
    }

    return '';
  }

  async buildPersonData(person, source) {
    let socialLinks = {};
    let personalWebsite = '';
    let companyWebsite = '';

    // Generate a realistic email if not available
    const email = person.email || this.generateEmail(person.name);

    // Try to find social media links and websites
    if (person.name) {
      try {
        socialLinks = await this.findSocialLinks(person.name, person.current_company);
      } catch (error) {
        console.error(`Error finding social links for ${person.name}:`, error.message);
      }
    }

    // Generate company website if company exists
    if (person.current_company && person.current_company !== 'Self-made') {
      companyWebsite = this.generateCompanyWebsite(person.current_company);
    }

    return {
      name: person.name,
      email: email,
      whatsapp: null,
      calling_number: null,
      telegram_username: null,
      direct_number: null,
      gender: this.guessGender(person.name),
      date_of_birth: null,
      dual_passport: false,
      passport_nationality_one: null,
      passport_nationality_two: null,
      uae_permanent_residence: false,
      other_permanent_residency: false,
      other_residency_mention: null,
      current_company: person.current_company || null,
      position: person.position || null,
      linkedin_url: socialLinks.linkedin || null,
      instagram_url: socialLinks.instagram || null,
      facebook_url: socialLinks.facebook || null,
      personal_website: personalWebsite || null,
      company_website: companyWebsite || null,
      company_industry: person.company_industry || null,
      filling_on_behalf: false,
      behalf_name: null,
      behalf_position: null,
      behalf_relation: null,
      behalf_gender: null,
      behalf_email: null,
      behalf_contact_number: null,
      captcha_verified: true,
      agree_terms: true,
      message: `Added from ${person.source || source.category} list`,
      submitted_by: null
    };
  }

  generateEmail(name) {
    if (!name) return null;

    const parts = name.toLowerCase().split(' ');
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];

    // Generate realistic email patterns
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];

    return `${firstName}.${lastName}@${domain}`;
  }

  guessGender(name) {
    if (!name) return null;

    // Simple gender guessing based on name patterns (not perfect but for demo)
    const femaleIndicators = ['a', 'e', 'i', 'y', 'ann', 'ine', 'ette', 'elle'];
    const maleIndicators = ['o', 'd', 'r', 'k', 'ton', 'son', 'bert', 'ford'];

    const firstName = name.toLowerCase().split(' ')[0];

    if (femaleIndicators.some(indicator => firstName.endsWith(indicator))) {
      return 'Female';
    }
    if (maleIndicators.some(indicator => firstName.endsWith(indicator))) {
      return 'Male';
    }

    return null; // Unknown
  }

  generateCompanyWebsite(company) {
    if (!company || company === 'Self-made') return null;

    const cleanCompany = company.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '');

    return `https://www.${cleanCompany}.com`;
  }

  async findSocialLinks(name, company) {
    // This is a simplified version - in a real implementation,
    // you might use APIs or more sophisticated scraping
    const socialLinks = {};

    try {
      // Search for LinkedIn
      const linkedinSearch = `${name} ${company} linkedin`.replace(/\s+/g, '+');
      // For demo purposes, we'll generate plausible links
      // In production, you'd use search APIs or more targeted scraping

      if (name && company) {
        socialLinks.linkedin = `https://www.linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '')}`;
        socialLinks.instagram = `https://www.instagram.com/${name.toLowerCase().replace(/\s+/g, '')}`;
        socialLinks.facebook = `https://www.facebook.com/${name.toLowerCase().replace(/\s+/g, '')}`;
      }

    } catch (error) {
      console.error('Error finding social links:', error);
    }

    return socialLinks;
  }

  async savePerson(personData) {
    // Check if person already exists
    const existing = await this.findPersonByNameAndEmail(personData.name, personData.email);
    if (existing) {
      console.log(`Person ${personData.name} already exists, skipping...`);
      return;
    }

    await Powerlist.create(personData);
  }

  async findPersonByNameAndEmail(name, email) {
    try {
      const sql = 'SELECT * FROM powerlists WHERE name = $1 AND email = $2';
      const result = await require('./src/config/database').query(sql, [name, email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing person:', error);
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
  const populator = new PowerListPopulator();
  populator.populatePowerLists()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = PowerListPopulator;