const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const Career = require('./src/models/Career');

// Career sources from job boards
const careerSources = [
  {
    url: 'https://www.indeed.com/jobs?q=marketing&l=',
    category: 'Marketing',
    region: 'Global'
  },
  {
    url: 'https://www.indeed.com/jobs?q=journalism&l=',
    category: 'Journalism',
    region: 'Global'
  },
  {
    url: 'https://www.indeed.com/jobs?q=pr&l=',
    category: 'PR',
    region: 'Global'
  },
  {
    url: 'https://www.indeed.com/jobs?q=digital+marketing&l=',
    category: 'Digital Marketing',
    region: 'Global'
  }
];

class CareerPopulator {
  constructor() {
    this.processedCareers = new Set();
  }

  async populateCareers() {
    try {
      console.log('Starting career population...');

      let totalSuccess = 0;
      let totalError = 0;

      for (const source of careerSources) {
        console.log(`\nProcessing ${source.category} careers from ${source.region}...`);

        try {
          const careers = await this.scrapeCareers(source);
          console.log(`Found ${careers.length} careers from ${source.url}`);

          for (const career of careers) {
            try {
              // Check if already processed
              if (this.processedCareers.has(career.title.toLowerCase())) {
                continue;
              }

              const careerData = await this.buildCareerData(career, source);
              await this.saveCareer(careerData);

              this.processedCareers.add(career.title.toLowerCase());
              totalSuccess++;
              console.log(`Saved career: ${career.title}`);

              // Delay to avoid rate limiting
              await this.delay(2000);
            } catch (error) {
              console.error(`Error processing career ${career.title}:`, error.message);
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
      console.error('Error in populateCareers:', error);
    }
  }

  async scrapeCareers(source) {
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

      const careers = [];

      // Scrape from Indeed
      if (source.url.includes('indeed.com')) {
        $('.job_seen_beacon, .jobsearch-ResultsList li').each((index, element) => {
          const $job = $(element);
          const title = $job.find('.jobTitle, h2').text().trim();
          const company = $job.find('.companyName, .company_location .companyName').text().trim();
          const location = $job.find('.companyLocation, .company_location .location').text().trim();
          const salary = $job.find('.salary-snippet, .salaryOnly').text().trim();
          const description = $job.find('.job-snippet').text().trim();

          if (title && company && title.length > 3) {
            careers.push({
              title: title,
              company: company,
              location: location,
              salary: salary,
              description: description,
              category: source.category,
              region: source.region
            });
          }
        });
      }

      await browser.close();
      return careers.slice(0, 10); // Limit per source

    } catch (error) {
      console.error(`Error scraping ${source.url}:`, error.message);
      return [];
    }
  }

  async buildCareerData(career, source) {
    // Generate random data for missing fields
    const companies = [
      'TechCorp Solutions', 'MediaHub Inc', 'Digital Dynamics', 'Content Creators Ltd',
      'PR Professionals', 'Marketing Masters', 'News Network', 'Creative Agency',
      'Communications Corp', 'Brand Builders'
    ];

    const locations = [
      'New York, NY', 'San Francisco, CA', 'London, UK', 'Toronto, Canada',
      'Sydney, Australia', 'Berlin, Germany', 'Singapore', 'Mumbai, India',
      'Dubai, UAE', 'Remote'
    ];

    const jobTypes = ['full-time', 'part-time', 'contract', 'freelance'];

    // Parse salary if available
    let salary = career.salary;
    if (!salary) {
      const salaryRanges = [
        '$50,000 - $70,000',
        '$70,000 - $90,000',
        '$90,000 - $120,000',
        '$30 - $50 per hour',
        'Competitive'
      ];
      salary = salaryRanges[Math.floor(Math.random() * salaryRanges.length)];
    }

    // Generate description if not available
    let description = career.description;
    if (!description || description.length < 50) {
      description = `We are looking for a talented ${career.title} to join our team. The ideal candidate will have experience in ${source.category.toLowerCase()} and a passion for delivering high-quality results. Responsibilities include developing strategies, managing campaigns, and working with cross-functional teams to achieve business objectives.`;
    }

    return {
      title: career.title,
      description: description,
      company: career.company || companies[Math.floor(Math.random() * companies.length)],
      location: career.location || locations[Math.floor(Math.random() * locations.length)],
      salary: salary,
      type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
      status: 'approved', // Auto-approve for population
      submitted_by: 1, // Assuming admin user
      is_active: true
    };
  }

  async saveCareer(careerData) {
    // Check if career already exists
    const existing = await this.findCareerByTitle(careerData.title);
    if (existing) {
      console.log(`Career ${careerData.title} already exists, skipping...`);
      return;
    }

    await Career.create(careerData);
  }

  async findCareerByTitle(title) {
    try {
      const sql = 'SELECT * FROM careers WHERE title = $1';
      const result = await require('./src/config/database').query(sql, [title]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing career:', error);
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
  const populator = new CareerPopulator();
  populator.populateCareers()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = CareerPopulator;