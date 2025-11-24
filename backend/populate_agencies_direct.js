const { Pool } = require('pg');
const Agency = require('./src/models/Agency');

// Create database connection like the server does
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Override the query function to use our pool
const originalQuery = require('./src/config/database').query;
require('./src/config/database').query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 100) + '...', duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Query error', { text: text.substring(0, 100) + '...', err: err.message });
    throw err;
  }
};

const sampleAgencies = [
  {
    agency_name: 'TechMedia Solutions',
    agency_legal_entity_name: 'TechMedia Solutions LLC',
    agency_website: 'https://techmediasolutions.com',
    agency_ig: 'https://instagram.com/techmediasolutions',
    agency_linkedin: 'https://linkedin.com/company/techmediasolutions',
    agency_facebook: 'https://facebook.com/techmediasolutions',
    agency_address: '123 Tech Street, Silicon Valley, CA 94043',
    agency_owner_name: 'John Smith',
    agency_owner_linkedin: 'https://linkedin.com/in/johnsmith',
    agency_founded_year: 2015,
    agency_owner_passport_nationality: 'American',
    agency_email: 'contact@techmediasolutions.com',
    agency_contact_number: '+1-555-0123',
    agency_owner_email: 'john@techmediasolutions.com',
    agency_owner_contact_number: '+1-555-0124',
    agency_owner_whatsapp_number: '+1-555-0124',
    status: 'approved',
    how_did_you_hear_about_us: 'Online search',
    any_to_say: 'Leading digital marketing agency specializing in tech companies.'
  },
  {
    agency_name: 'Global PR Partners',
    agency_legal_entity_name: 'Global PR Partners Inc',
    agency_website: 'https://globalprpartners.com',
    agency_ig: 'https://instagram.com/globalprpartners',
    agency_linkedin: 'https://linkedin.com/company/globalprpartners',
    agency_facebook: 'https://facebook.com/globalprpartners',
    agency_address: '456 Media Avenue, New York, NY 10001',
    agency_owner_name: 'Sarah Johnson',
    agency_owner_linkedin: 'https://linkedin.com/in/sarahjohnson',
    agency_founded_year: 2012,
    agency_owner_passport_nationality: 'American',
    agency_email: 'info@globalprpartners.com',
    agency_contact_number: '+1-555-0567',
    agency_owner_email: 'sarah@globalprpartners.com',
    agency_owner_contact_number: '+1-555-0568',
    agency_owner_whatsapp_number: '+1-555-0568',
    status: 'approved',
    how_did_you_hear_about_us: 'Industry conference',
    any_to_say: 'Comprehensive PR services for global brands.'
  },
  {
    agency_name: 'Creative Advertising Hub',
    agency_legal_entity_name: 'Creative Advertising Hub Ltd',
    agency_website: 'https://creativeadvertisinghub.com',
    agency_ig: 'https://instagram.com/creativeadvertisinghub',
    agency_linkedin: 'https://linkedin.com/company/creativeadvertisinghub',
    agency_facebook: 'https://facebook.com/creativeadvertisinghub',
    agency_address: '789 Creative Blvd, Los Angeles, CA 90210',
    agency_owner_name: 'Michael Davis',
    agency_owner_linkedin: 'https://linkedin.com/in/michaeldavis',
    agency_founded_year: 2018,
    agency_owner_passport_nationality: 'American',
    agency_email: 'hello@creativeadvertisinghub.com',
    agency_contact_number: '+1-555-0890',
    agency_owner_email: 'michael@creativeadvertisinghub.com',
    agency_owner_contact_number: '+1-555-0891',
    agency_owner_whatsapp_number: '+1-555-0891',
    status: 'approved',
    how_did_you_hear_about_us: 'Social media',
    any_to_say: 'Award-winning advertising agency focused on creative campaigns.'
  },
  {
    agency_name: 'Digital Growth Agency',
    agency_legal_entity_name: 'Digital Growth Agency LLC',
    agency_website: 'https://digitalgrowthagency.com',
    agency_ig: 'https://instagram.com/digitalgrowthagency',
    agency_linkedin: 'https://linkedin.com/company/digitalgrowthagency',
    agency_facebook: 'https://facebook.com/digitalgrowthagency',
    agency_address: '321 Growth Street, Austin, TX 78701',
    agency_owner_name: 'Emma Wilson',
    agency_owner_linkedin: 'https://linkedin.com/in/emmawilson',
    agency_founded_year: 2016,
    agency_owner_passport_nationality: 'American',
    agency_email: 'contact@digitalgrowthagency.com',
    agency_contact_number: '+1-555-0345',
    agency_owner_email: 'emma@digitalgrowthagency.com',
    agency_owner_contact_number: '+1-555-0346',
    agency_owner_whatsapp_number: '+1-555-0346',
    status: 'approved',
    how_did_you_hear_about_us: 'Referral',
    any_to_say: 'Data-driven digital marketing agency specializing in growth strategies.'
  },
  {
    agency_name: 'Media Masters',
    agency_legal_entity_name: 'Media Masters Corporation',
    agency_website: 'https://mediamasters.com',
    agency_ig: 'https://instagram.com/mediamasters',
    agency_linkedin: 'https://linkedin.com/company/mediamasters',
    agency_facebook: 'https://facebook.com/mediamasters',
    agency_address: '654 Media Drive, Chicago, IL 60601',
    agency_owner_name: 'David Brown',
    agency_owner_linkedin: 'https://linkedin.com/in/davidbrown',
    agency_founded_year: 2010,
    agency_owner_passport_nationality: 'American',
    agency_email: 'info@mediamasters.com',
    agency_contact_number: '+1-555-0678',
    agency_owner_email: 'david@mediamasters.com',
    agency_owner_contact_number: '+1-555-0679',
    agency_owner_whatsapp_number: '+1-555-0679',
    status: 'approved',
    how_did_you_hear_about_us: 'Online directory',
    any_to_say: 'Full-service media agency with expertise in traditional and digital media.'
  }
];

async function populateAgencies() {
  console.log('Starting direct agency population...');

  let successCount = 0;
  let errorCount = 0;

  for (const agencyData of sampleAgencies) {
    try {
      await Agency.create(agencyData);
      console.log(`Created agency: ${agencyData.agency_name}`);
      successCount++;
    } catch (error) {
      // If it's a duplicate key error, just skip
      if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
        console.log(`Agency ${agencyData.agency_name} already exists, skipping...`);
        continue;
      }
      console.error(`Error creating agency ${agencyData.agency_name}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\nPopulation complete. Success: ${successCount}, Errors: ${errorCount}`);
}

// Run the script
if (require.main === module) {
  require('dotenv').config();
  populateAgencies()
    .then(async () => {
      console.log('Script completed successfully');
      await pool.end();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Script failed:', error);
      await pool.end();
      process.exit(1);
    });
}

module.exports = { populateAgencies };