const EventEnquiry = require('./src/models/EventEnquiry');

class EventEnquiryPopulator {
  constructor() {
    this.processedEnquiries = new Set();
  }

  async populateEventEnquiries() {
    try {
      console.log('Starting event enquiry population...');

      const enquiries = this.generateSampleEnquiries();
      let totalSuccess = 0;
      let totalError = 0;

      for (const enquiry of enquiries) {
        try {
          const enquiryData = this.buildEnquiryData(enquiry);
          await this.saveEnquiry(enquiryData);

          totalSuccess++;
          console.log(`Saved enquiry: ${enquiry.event_name}`);

          // Small delay
          await this.delay(500);
        } catch (error) {
          console.error(`Error processing enquiry ${enquiry.event_name}:`, error.message);
          totalError++;
        }
      }

      console.log(`\nPopulation complete. Success: ${totalSuccess}, Errors: ${totalError}`);

    } catch (error) {
      console.error('Error in populateEventEnquiries:', error);
    }
  }

  generateSampleEnquiries() {
    const enquiries = [
      {
        event_name: 'Tech Innovation Summit 2024',
        organiser: 'TechCorp Solutions',
        industry: 'Technology',
        sub_industry: 'Software Development',
        country: 'United States',
        city: 'San Francisco',
        venue: 'Moscone Center',
        mode: 'in person',
        type: 'conference',
        organised_by: 'private',
        commercial: 'profit oriented',
        entrance: 'ticket based',
        contact_name: 'Sarah Johnson',
        contact_email: 'sarah@techcorp.com',
        contact_number: '+1-555-0123',
        message: 'We are organizing a major tech conference and would like to feature your platform for media coverage.'
      },
      {
        event_name: 'Global Business Forum',
        organiser: 'Business Leaders Association',
        industry: 'Business',
        sub_industry: 'Consulting',
        country: 'United Kingdom',
        city: 'London',
        venue: 'ExCeL London',
        mode: 'in person',
        type: 'expo',
        organised_by: 'private',
        commercial: 'profit oriented',
        entrance: 'ticket based',
        contact_name: 'Michael Chen',
        contact_email: 'michael@bla.co.uk',
        contact_number: '+44-20-7946-0123',
        message: 'Planning a large business expo and interested in media partnerships.'
      },
      {
        event_name: 'Healthcare Innovation Conference',
        organiser: 'Medical Association',
        industry: 'Healthcare',
        sub_industry: 'Medical Devices',
        country: 'Germany',
        city: 'Berlin',
        venue: 'Estrel Congress Center',
        mode: 'in person',
        type: 'conference',
        organised_by: 'ngo',
        commercial: 'community oriented',
        entrance: 'ticket based',
        contact_name: 'Dr. Anna Schmidt',
        contact_email: 'anna@medical-assoc.de',
        contact_number: '+49-30-12345678',
        message: 'Our annual healthcare conference needs comprehensive media coverage.'
      },
      {
        event_name: 'Digital Marketing World Summit',
        organiser: 'Marketing Pro Agency',
        industry: 'Marketing',
        sub_industry: 'Digital Marketing',
        country: 'Australia',
        city: 'Sydney',
        venue: 'International Convention Centre',
        mode: 'in person',
        type: 'seminar',
        organised_by: 'private',
        commercial: 'profit oriented',
        entrance: 'ticket based',
        contact_name: 'James Wilson',
        contact_email: 'james@marketingpro.com.au',
        contact_number: '+61-2-9876-5432',
        message: 'Looking for media partners for our digital marketing summit.'
      },
      {
        event_name: 'Startup Pitch Competition',
        organiser: 'Innovation Hub',
        industry: 'Technology',
        sub_industry: 'Startups',
        country: 'Canada',
        city: 'Toronto',
        venue: 'Metro Toronto Convention Centre',
        mode: 'in person',
        type: 'networking',
        organised_by: 'private',
        commercial: 'profit oriented',
        entrance: 'invite based',
        contact_name: 'Lisa Park',
        contact_email: 'lisa@innovationhub.ca',
        contact_number: '+1-416-555-0199',
        message: 'Annual startup event seeking media coverage and journalist attendance.'
      },
      {
        event_name: 'Environmental Sustainability Forum',
        organiser: 'Green Earth Foundation',
        industry: 'Environment',
        sub_industry: 'Sustainability',
        country: 'Netherlands',
        city: 'Amsterdam',
        venue: 'RAI Amsterdam',
        mode: 'in person',
        type: 'forum',
        organised_by: 'ngo',
        commercial: 'community oriented',
        entrance: 'free for all',
        contact_name: 'Mark van der Berg',
        contact_email: 'mark@greenearth.nl',
        contact_number: '+31-20-123-4567',
        message: 'Environmental forum focused on sustainability solutions.'
      },
      {
        event_name: 'AI & Machine Learning Conference',
        organiser: 'AI Research Institute',
        industry: 'Technology',
        sub_industry: 'Artificial Intelligence',
        country: 'Singapore',
        city: 'Singapore',
        venue: 'Marina Bay Sands',
        mode: 'in person',
        type: 'conference',
        organised_by: 'private',
        commercial: 'profit oriented',
        entrance: 'ticket based',
        contact_name: 'Dr. Rajesh Kumar',
        contact_email: 'rajesh@airesearch.sg',
        contact_number: '+65-6789-0123',
        message: 'Leading AI conference seeking international media coverage.'
      },
      {
        event_name: 'Fashion Week Showcase',
        organiser: 'Fashion Designers Guild',
        industry: 'Fashion',
        sub_industry: 'Design',
        country: 'France',
        city: 'Paris',
        venue: 'Carrousel du Louvre',
        mode: 'in person',
        type: 'exhibition',
        organised_by: 'private',
        commercial: 'profit oriented',
        entrance: 'invite based',
        contact_name: 'Marie Dubois',
        contact_email: 'marie@fashionguild.fr',
        contact_number: '+33-1-42-86-75-39',
        message: 'Annual fashion showcase event for media and press coverage.'
      },
      {
        event_name: 'Virtual Reality Expo',
        organiser: 'VR Technologies Inc',
        industry: 'Technology',
        sub_industry: 'Virtual Reality',
        country: 'Japan',
        city: 'Tokyo',
        venue: 'Tokyo Big Sight',
        mode: 'in person',
        type: 'expo',
        organised_by: 'private',
        commercial: 'profit oriented',
        entrance: 'ticket based',
        contact_name: 'Hiroshi Tanaka',
        contact_email: 'hiroshi@vrtech.jp',
        contact_number: '+81-3-1234-5678',
        message: 'VR technology exhibition and conference.'
      },
      {
        event_name: 'Music Awards Ceremony',
        organiser: 'Music Industry Association',
        industry: 'Entertainment',
        sub_industry: 'Music',
        country: 'United States',
        city: 'Los Angeles',
        venue: 'Hollywood Bowl',
        mode: 'in person',
        type: 'awards',
        organised_by: 'private',
        commercial: 'profit oriented',
        entrance: 'invite based',
        contact_name: 'Jennifer Lopez',
        contact_email: 'jennifer@musicawards.com',
        contact_number: '+1-323-555-0147',
        message: 'Annual music awards show seeking comprehensive media coverage.'
      }
    ];

    return enquiries;
  }

  buildEnquiryData(enquiry) {
    // Generate future date for the event
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 365) + 30); // 30-395 days from now

    return {
      event_name: enquiry.event_name,
      event_date: futureDate.toISOString().split('T')[0],
      organiser: enquiry.organiser,
      event_industry: enquiry.industry,
      event_sub_industry: enquiry.sub_industry,
      country: enquiry.country,
      city: enquiry.city,
      event_venue_name: enquiry.venue,
      google_map_location: `https://maps.google.com/?q=${enquiry.city},${enquiry.country}`,
      event_mode: enquiry.mode,
      event_type: enquiry.type,
      event_organised_by: enquiry.organised_by,
      event_commercial: enquiry.commercial,
      event_website: `https://www.${enquiry.organiser.toLowerCase().replace(/\s+/g, '')}.com`,
      event_ig: `https://instagram.com/${enquiry.organiser.toLowerCase().replace(/\s+/g, '')}`,
      event_linkedin: `https://linkedin.com/company/${enquiry.organiser.toLowerCase().replace(/\s+/g, '')}`,
      event_facebook: `https://facebook.com/${enquiry.organiser.toLowerCase().replace(/\s+/g, '')}`,
      event_youtube: `https://youtube.com/c/${enquiry.organiser.toLowerCase().replace(/\s+/g, '')}`,
      event_entrance: enquiry.entrance,
      contact_person_name: enquiry.contact_name,
      contact_person_email: enquiry.contact_email,
      contact_person_number: enquiry.contact_number,
      contact_person_whatsapp: enquiry.contact_number,
      market_company_name: Math.random() > 0.5,
      provide_booth: Math.random() > 0.7,
      terms_and_conditions: true,
      how_did_you_hear: ['Google Search', 'Social Media', 'Referral', 'Website'][Math.floor(Math.random() * 4)],
      message: enquiry.message,
      status: ['new', 'viewed'][Math.floor(Math.random() * 2)]
    };
  }

  async saveEnquiry(enquiryData) {
    // Check if enquiry already exists
    const existing = await this.findEnquiryByEventName(enquiryData.event_name);
    if (existing) {
      console.log(`Enquiry for ${enquiryData.event_name} already exists, skipping...`);
      return;
    }

    await EventEnquiry.create(enquiryData);
  }

  async findEnquiryByEventName(eventName) {
    try {
      const sql = 'SELECT * FROM event_enquiries WHERE event_name = $1';
      const result = await require('./src/config/database').query(sql, [eventName]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing enquiry:', error);
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
  const populator = new EventEnquiryPopulator();
  populator.populateEventEnquiries()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = EventEnquiryPopulator;