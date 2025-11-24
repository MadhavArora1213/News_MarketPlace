const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const Radio = require('./src/models/Radio');

// Radio sources from directories and Wikipedia
const radioSources = [
  {
    url: 'https://en.wikipedia.org/wiki/List_of_radio_stations_in_the_United_States',
    category: 'US Radio Stations',
    region: 'United States'
  },
  {
    url: 'https://en.wikipedia.org/wiki/List_of_radio_stations_in_the_United_Kingdom',
    category: 'UK Radio Stations',
    region: 'United Kingdom'
  },
  {
    url: 'https://en.wikipedia.org/wiki/List_of_radio_stations_in_Canada',
    category: 'Canadian Radio Stations',
    region: 'Canada'
  },
  {
    url: 'https://en.wikipedia.org/wiki/List_of_radio_stations_in_Australia',
    category: 'Australian Radio Stations',
    region: 'Australia'
  }
];

class RadioPopulator {
  constructor() {
    this.processedRadios = new Set();
  }

  async populateRadios() {
    try {
      console.log('Starting radio population...');

      let totalSuccess = 0;
      let totalError = 0;

      for (const source of radioSources) {
        console.log(`\nProcessing ${source.category} from ${source.region}...`);

        try {
          const radios = await this.scrapeRadios(source);
          console.log(`Found ${radios.length} radios from ${source.url}`);

          for (const radio of radios) {
            try {
              // Check if already processed
              if (this.processedRadios.has(radio.name.toLowerCase())) {
                continue;
              }

              const radioData = await this.buildRadioData(radio, source);
              await this.saveRadio(radioData);

              this.processedRadios.add(radio.name.toLowerCase());
              totalSuccess++;
              console.log(`Saved radio: ${radio.name}`);

              // Delay to avoid rate limiting
              await this.delay(2000);
            } catch (error) {
              console.error(`Error processing radio ${radio.name}:`, error.message);
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
      console.error('Error in populateRadios:', error);
    }
  }

  async scrapeRadios(source) {
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

      const radios = [];

      // Scrape from Wikipedia radio station lists
      $('table.wikitable tr').each((index, element) => {
        if (index === 0) return; // Skip header

        const $row = $(element);
        const $cells = $row.find('td');

        if ($cells.length >= 2) {
          const name = $cells.first().text().trim();
          let frequency = '';
          let location = '';

          // Try to find frequency and location in other cells
          $cells.each((cellIndex, cell) => {
            const text = $(cell).text().trim();
            if (cellIndex === 1 && (text.includes('FM') || text.includes('AM') || text.match(/\d+\.\d+/))) {
              frequency = text;
            }
            if (cellIndex === 2 && text) {
              location = text;
            }
          });

          if (name && name.length > 2 && !name.includes('—') && !name.includes('N/A')) {
            radios.push({
              name: name,
              frequency: frequency,
              location: location,
              category: source.category,
              region: source.region
            });
          }
        }
      });

      await browser.close();
      return radios.slice(0, 15); // Limit per source

    } catch (error) {
      console.error(`Error scraping ${source.url}:`, error.message);
      return [];
    }
  }

  async buildRadioData(radio, source) {
    // Generate random data for missing fields
    const languages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Arabic', 'Chinese', 'Japanese'];
    const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'];
    const popularRJs = [
      'DJ Alex', 'Radio Star', 'Music Master', 'Voice of the City', 'Sound Wave',
      'Beat Maker', 'Tune Master', 'Air Wave', 'Frequency King', 'Sonic Boom'
    ];

    // Parse frequency if available
    let frequency = radio.frequency;
    if (!frequency) {
      const freqTypes = ['FM', 'AM'];
      const type = freqTypes[Math.floor(Math.random() * freqTypes.length)];
      if (type === 'FM') {
        frequency = `${(87 + Math.random() * 21).toFixed(1)} ${type}`;
      } else {
        frequency = `${(530 + Math.floor(Math.random() * 1170))} ${type}`;
      }
    }

    // Generate website if not available
    let website = '';
    if (radio.name) {
      const cleanName = radio.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      website = `https://www.${cleanName}radio.com`;
    }

    return {
      radio_name: radio.name,
      frequency: frequency,
      radio_language: languages[Math.floor(Math.random() * languages.length)],
      radio_website: website,
      radio_linkedin: `https://linkedin.com/company/${radio.name.toLowerCase().replace(/\s+/g, '')}-radio`,
      radio_instagram: `https://instagram.com/${radio.name.toLowerCase().replace(/\s+/g, '')}radio`,
      emirate_state: emirates[Math.floor(Math.random() * emirates.length)],
      radio_popular_rj: popularRJs[Math.floor(Math.random() * popularRJs.length)],
      remarks: `Popular radio station in ${source.region} broadcasting ${frequency}.`
    };
  }

  async saveRadio(radioData) {
    // Check if radio already exists
    const existing = await this.findRadioByName(radioData.radio_name);
    if (existing) {
      console.log(`Radio ${radioData.radio_name} already exists, skipping...`);
      return;
    }

    await Radio.create(radioData);
  }

  async findRadioByName(name) {
    try {
      const sql = 'SELECT * FROM radios WHERE radio_name = $1';
      const result = await require('./src/config/database').query(sql, [name]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing radio:', error);
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
  const populator = new RadioPopulator();
  populator.populateRadios()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = RadioPopulator;