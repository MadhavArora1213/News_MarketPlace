const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const Event = require('./src/models/Event');

// Event sources from various platforms
const eventSources = [
  {
    url: 'https://www.eventbrite.com/d/online/all-events/',
    category: 'Online Events',
    region: 'Global'
  },
  {
    url: 'https://www.eventbrite.com/d/united-states--ca/business--events/',
    category: 'Business',
    region: 'United States'
  },
  {
    url: 'https://www.eventbrite.com/d/india--dl/tech-events/',
    category: 'Technology',
    region: 'India'
  },
  {
    url: 'https://www.meetup.com/cities/us/ca/los_angeles/',
    category: 'Community',
    region: 'Los Angeles'
  }
];

class EventPopulator {
  constructor() {
    this.processedEvents = new Set();
  }

  async populateEvents() {
    try {
      console.log('Starting event population...');

      let totalSuccess = 0;
      let totalError = 0;

      for (const source of eventSources) {
        console.log(`\nProcessing ${source.category} events from ${source.region}...`);

        try {
          const events = await this.scrapeEvents(source);
          console.log(`Found ${events.length} events from ${source.url}`);

          for (const event of events) {
            try {
              // Check if already processed
              if (this.processedEvents.has(event.title.toLowerCase())) {
                continue;
              }

              const eventData = await this.buildEventData(event, source);
              await this.saveEvent(eventData);

              this.processedEvents.add(event.title.toLowerCase());
              totalSuccess++;
              console.log(`Saved event: ${event.title}`);

              // Delay to avoid rate limiting
              await this.delay(2000);
            } catch (error) {
              console.error(`Error processing event ${event.title}:`, error.message);
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
      console.error('Error in populateEvents:', error);
    }
  }

  async scrapeEvents(source) {
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

      const events = [];

      // Scrape from Eventbrite
      if (source.url.includes('eventbrite.com')) {
        $('.event-card, [data-testid="event-card"]').each((index, element) => {
          const $card = $(element);
          const title = $card.find('[data-testid="event-card-title"], .event-card__title').text().trim();
          const date = $card.find('[data-testid="event-card-date"], .event-card__date').text().trim();
          const location = $card.find('[data-testid="event-card-location"], .event-card__location').text().trim();
          const organizer = $card.find('[data-testid="event-card-organizer"], .event-card__organizer').text().trim();
          const link = $card.find('a').first().attr('href');

          if (title && title.length > 3) {
            events.push({
              title: title,
              date: date,
              location: location,
              organizer: organizer,
              link: link,
              category: source.category,
              region: source.region
            });
          }
        });
      }

      // Scrape from Meetup
      if (source.url.includes('meetup.com')) {
        $('.eventCard, .event-card').each((index, element) => {
          const $card = $(element);
          const title = $card.find('h2, .event-title').text().trim();
          const date = $card.find('.eventTime, .date').text().trim();
          const location = $card.find('.venue, .location').text().trim();
          const organizer = $card.find('.group-name, .organizer').text().trim();

          if (title && title.length > 3) {
            events.push({
              title: title,
              date: date,
              location: location,
              organizer: organizer,
              category: source.category,
              region: source.region
            });
          }
        });
      }

      await browser.close();
      return events.slice(0, 10); // Limit per source

    } catch (error) {
      console.error(`Error scraping ${source.url}:`, error.message);
      return [];
    }
  }

  async buildEventData(event, source) {
    // Parse date
    let startDate = new Date();
    let endDate = new Date();
    let month = startDate.toLocaleString('default', { month: 'long' });

    try {
      if (event.date) {
        // Try to parse various date formats
        const dateStr = event.date.replace(/st|nd|rd|th/g, '');
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate)) {
          startDate = parsedDate;
          endDate = new Date(parsedDate.getTime() + 24 * 60 * 60 * 1000); // Next day
          month = startDate.toLocaleString('default', { month: 'long' });
        }
      }
    } catch (error) {
      console.log(`Could not parse date for ${event.title}, using current date`);
    }

    // Parse location
    let country = source.region;
    let city = '';
    if (event.location) {
      const locationParts = event.location.split(',');
      if (locationParts.length > 1) {
        city = locationParts[0].trim();
        country = locationParts[locationParts.length - 1].trim();
      } else {
        city = event.location;
      }
    }

    // Generate random data for missing fields
    const eventTypes = ['Conference', 'Workshop', 'Seminar', 'Networking', 'Webinar', 'Trade Show'];
    const venues = ['Convention Center', 'Hotel Ballroom', 'Community Hall', 'Online', 'University Campus'];
    const organizers = event.organizer || ['Tech Corp', 'Business Inc', 'Community Group', 'Professional Association'];

    const randomCapacity = Math.floor(Math.random() * 500) + 50;
    const isFree = Math.random() > 0.7; // 30% chance of being free

    return {
      title: event.title,
      description: `Join us for ${event.title}, a ${source.category.toLowerCase()} event featuring expert speakers and valuable insights.`,
      country: country,
      city: city,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      month: month,
      event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      is_free: isFree,
      organizer: Array.isArray(organizers) ? organizers[Math.floor(Math.random() * organizers.length)] : organizers,
      venue: venues[Math.floor(Math.random() * venues.length)],
      capacity: randomCapacity,
      registration_deadline: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week before
      status: 'active',
      enable_sponsor: Math.random() > 0.5,
      enable_media_partner: Math.random() > 0.5,
      enable_speaker: Math.random() > 0.5,
      enable_guest: Math.random() > 0.5,
      created_by: 1 // Assuming admin user ID
    };
  }

  async saveEvent(eventData) {
    // Check if event already exists
    const existing = await this.findEventByTitle(eventData.title);
    if (existing) {
      console.log(`Event ${eventData.title} already exists, skipping...`);
      return;
    }

    await Event.create(eventData);
  }

  async findEventByTitle(title) {
    try {
      const sql = 'SELECT * FROM events WHERE title = $1';
      const result = await require('./src/config/database').query(sql, [title]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing event:', error);
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
  const populator = new EventPopulator();
  populator.populateEvents()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = EventPopulator;