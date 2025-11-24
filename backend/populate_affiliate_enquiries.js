const AffiliateEnquiry = require('./src/models/AffiliateEnquiry');

class AffiliateEnquiryPopulator {
  constructor() {
    this.processedEnquiries = new Set();
  }

  async populateAffiliateEnquiries() {
    try {
      console.log('Starting affiliate enquiry population...');

      const enquiries = this.generateSampleEnquiries();
      let totalSuccess = 0;
      let totalError = 0;

      for (const enquiry of enquiries) {
        try {
          const enquiryData = this.buildEnquiryData(enquiry);
          await this.saveEnquiry(enquiryData);

          totalSuccess++;
          console.log(`Saved enquiry: ${enquiry.name}`);

          // Small delay
          await this.delay(500);
        } catch (error) {
          console.error(`Error processing enquiry ${enquiry.name}:`, error.message);
          totalError++;
        }
      }

      console.log(`\nPopulation complete. Success: ${totalSuccess}, Errors: ${totalError}`);

    } catch (error) {
      console.error('Error in populateAffiliateEnquiries:', error);
    }
  }

  generateSampleEnquiries() {
    const enquiries = [
      {
        name: 'John Smith',
        gender: 'Male',
        email: 'john.smith@email.com',
        whatsapp: '+1-555-0123',
        linkedin: 'https://linkedin.com/in/johnsmith',
        ig: 'https://instagram.com/johnsmith',
        facebook: 'https://facebook.com/johnsmith',
        nationality: 'American',
        residency: 'New York, USA',
        how_heard: 'Google Search',
        message: 'I am interested in becoming an affiliate for your platform. I have experience in digital marketing.'
      },
      {
        name: 'Maria Garcia',
        gender: 'Female',
        email: 'maria.garcia@email.com',
        whatsapp: '+34-612-345-678',
        linkedin: 'https://linkedin.com/in/mariagarcia',
        ig: 'https://instagram.com/mariagarcia',
        facebook: 'https://facebook.com/mariagarcia',
        nationality: 'Spanish',
        residency: 'Madrid, Spain',
        how_heard: 'Social Media',
        message: 'Looking to join your affiliate program. I have a large following on social media.'
      },
      {
        name: 'Ahmed Hassan',
        gender: 'Male',
        email: 'ahmed.hassan@email.com',
        whatsapp: '+971-50-123-4567',
        linkedin: 'https://linkedin.com/in/ahmedhassan',
        ig: 'https://instagram.com/ahmedhassan',
        facebook: 'https://facebook.com/ahmedhassan',
        nationality: 'Emirati',
        residency: 'Dubai, UAE',
        how_heard: 'Referral',
        message: 'Heard about your affiliate program from a friend. Interested in promoting your services.'
      },
      {
        name: 'Sarah Johnson',
        gender: 'Female',
        email: 'sarah.johnson@email.com',
        whatsapp: '+44-7700-123456',
        linkedin: 'https://linkedin.com/in/sarahjohnson',
        ig: 'https://instagram.com/sarahjohnson',
        facebook: 'https://facebook.com/sarahjohnson',
        nationality: 'British',
        residency: 'London, UK',
        how_heard: 'Website',
        message: 'I run a blog about business and marketing. Would love to be part of your affiliate network.'
      },
      {
        name: 'Chen Wei',
        gender: 'Male',
        email: 'chen.wei@email.com',
        whatsapp: '+86-138-0013-8000',
        linkedin: 'https://linkedin.com/in/chenwei',
        ig: 'https://instagram.com/chenwei',
        facebook: 'https://facebook.com/chenwei',
        nationality: 'Chinese',
        residency: 'Shanghai, China',
        how_heard: 'Google Search',
        message: 'Interested in affiliate marketing opportunities. I have experience in content creation.'
      },
      {
        name: 'Priya Patel',
        gender: 'Female',
        email: 'priya.patel@email.com',
        whatsapp: '+91-98765-43210',
        linkedin: 'https://linkedin.com/in/priyapatel',
        ig: 'https://instagram.com/priyapatel',
        facebook: 'https://facebook.com/priyapatel',
        nationality: 'Indian',
        residency: 'Mumbai, India',
        how_heard: 'Social Media',
        message: 'Digital marketing professional looking to expand my income through affiliate programs.'
      },
      {
        name: 'Michael Brown',
        gender: 'Male',
        email: 'michael.brown@email.com',
        whatsapp: '+61-412-345-678',
        linkedin: 'https://linkedin.com/in/michaelbrown',
        ig: 'https://instagram.com/michaelbrown',
        facebook: 'https://facebook.com/michaelbrown',
        nationality: 'Australian',
        residency: 'Sydney, Australia',
        how_heard: 'Referral',
        message: 'Recommended by a colleague. Interested in your affiliate partnership program.'
      },
      {
        name: 'Emma Wilson',
        gender: 'Female',
        email: 'emma.wilson@email.com',
        whatsapp: '+49-170-1234567',
        linkedin: 'https://linkedin.com/in/emmawilson',
        ig: 'https://instagram.com/emmawilson',
        facebook: 'https://facebook.com/emmawilson',
        nationality: 'German',
        residency: 'Berlin, Germany',
        how_heard: 'Website',
        message: 'Content creator and influencer interested in affiliate marketing opportunities.'
      },
      {
        name: 'Carlos Rodriguez',
        gender: 'Male',
        email: 'carlos.rodriguez@email.com',
        whatsapp: '+52-55-1234-5678',
        linkedin: 'https://linkedin.com/in/carlosrodriguez',
        ig: 'https://instagram.com/carlosrodriguez',
        facebook: 'https://facebook.com/carlosrodriguez',
        nationality: 'Mexican',
        residency: 'Mexico City, Mexico',
        how_heard: 'Google Search',
        message: 'Business consultant looking to join affiliate programs that align with my expertise.'
      },
      {
        name: 'Yuki Tanaka',
        gender: 'Female',
        email: 'yuki.tanaka@email.com',
        whatsapp: '+81-90-1234-5678',
        linkedin: 'https://linkedin.com/in/yukitanaka',
        ig: 'https://instagram.com/yukitanaka',
        facebook: 'https://facebook.com/yukitanaka',
        nationality: 'Japanese',
        residency: 'Tokyo, Japan',
        how_heard: 'Social Media',
        message: 'Social media marketer interested in expanding my affiliate network.'
      },
      {
        name: 'David Kim',
        gender: 'Male',
        email: 'david.kim@email.com',
        whatsapp: '+82-10-1234-5678',
        linkedin: 'https://linkedin.com/in/davidkim',
        ig: 'https://instagram.com/davidkim',
        facebook: 'https://facebook.com/davidkim',
        nationality: 'South Korean',
        residency: 'Seoul, South Korea',
        how_heard: 'Referral',
        message: 'Tech blogger and YouTuber looking for affiliate partnerships.'
      },
      {
        name: 'Anna Kowalski',
        gender: 'Female',
        email: 'anna.kowalski@email.com',
        whatsapp: '+48-500-123-456',
        linkedin: 'https://linkedin.com/in/annakowalski',
        ig: 'https://instagram.com/annakowalski',
        facebook: 'https://facebook.com/annakowalski',
        nationality: 'Polish',
        residency: 'Warsaw, Poland',
        how_heard: 'Website',
        message: 'Marketing specialist interested in affiliate marketing opportunities.'
      },
      {
        name: 'Luca Rossi',
        gender: 'Male',
        email: 'luca.rossi@email.com',
        whatsapp: '+39-333-123-4567',
        linkedin: 'https://linkedin.com/in/lucarossi',
        ig: 'https://instagram.com/lucarossi',
        facebook: 'https://facebook.com/lucarossi',
        nationality: 'Italian',
        residency: 'Milan, Italy',
        how_heard: 'Google Search',
        message: 'Digital entrepreneur looking to join your affiliate program.'
      },
      {
        name: 'Fatima Al-Zahra',
        gender: 'Female',
        email: 'fatima.alzahra@email.com',
        whatsapp: '+966-50-123-4567',
        linkedin: 'https://linkedin.com/in/fatimaalzahra',
        ig: 'https://instagram.com/fatimaalzahra',
        facebook: 'https://facebook.com/fatimaalzahra',
        nationality: 'Saudi Arabian',
        residency: 'Riyadh, Saudi Arabia',
        how_heard: 'Social Media',
        message: 'Business development professional interested in affiliate partnerships.'
      },
      {
        name: 'James Mitchell',
        gender: 'Male',
        email: 'james.mitchell@email.com',
        whatsapp: '+27-71-123-4567',
        linkedin: 'https://linkedin.com/in/jamesmitchell',
        ig: 'https://instagram.com/jamesmitchell',
        facebook: 'https://facebook.com/jamesmitchell',
        nationality: 'South African',
        residency: 'Cape Town, South Africa',
        how_heard: 'Referral',
        message: 'Marketing consultant looking to expand through affiliate programs.'
      }
    ];

    return enquiries;
  }

  buildEnquiryData(enquiry) {
    return {
      name: enquiry.name,
      gender: enquiry.gender,
      email: enquiry.email,
      whatsapp: enquiry.whatsapp,
      linkedin: enquiry.linkedin,
      ig: enquiry.ig,
      facebook: enquiry.facebook,
      passport_nationality: enquiry.nationality,
      current_residency: enquiry.residency,
      how_did_you_hear: enquiry.how_heard,
      message: enquiry.message,
      terms_accepted: true,
      captcha_verified: true,
      submitted_at: new Date().toISOString(),
      status: ['new', 'viewed'][Math.floor(Math.random() * 2)]
    };
  }

  async saveEnquiry(enquiryData) {
    // Check if enquiry already exists
    const existing = await this.findEnquiryByEmail(enquiryData.email);
    if (existing) {
      console.log(`Enquiry for ${enquiryData.email} already exists, skipping...`);
      return;
    }

    await AffiliateEnquiry.create(enquiryData);
  }

  async findEnquiryByEmail(email) {
    try {
      const sql = 'SELECT * FROM affiliate_enquiries WHERE email = $1';
      const result = await require('./src/config/database').query(sql, [email]);
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
  const populator = new AffiliateEnquiryPopulator();
  populator.populateAffiliateEnquiries()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = AffiliateEnquiryPopulator;