const Reporter = require('./src/models/Reporter');

class ReporterPopulator {
  constructor() {
    this.processedReporters = new Set();
  }

  async populateReporters() {
    try {
      console.log('Starting reporter population...');

      const reporters = this.generateSampleReporters();
      let totalSuccess = 0;
      let totalError = 0;

      for (const reporter of reporters) {
        try {
          const reporterData = this.buildReporterData(reporter);
          await this.saveReporter(reporterData);

          totalSuccess++;
          console.log(`Saved reporter: ${reporter.name}`);

          // Small delay
          await this.delay(500);
        } catch (error) {
          console.error(`Error processing reporter ${reporter.name}:`, error.message);
          totalError++;
        }
      }

      console.log(`\nPopulation complete. Success: ${totalSuccess}, Errors: ${totalError}`);

    } catch (error) {
      console.error('Error in populateReporters:', error);
    }
  }

  generateSampleReporters() {
    const reporters = [
      {
        department: 'News',
        position: 'Senior Reporter',
        name: 'Sarah Johnson',
        gender: 'Female',
        email: 'sarah.johnson@newsdaily.com',
        whatsapp: '+1-555-0123',
        publication: 'News Daily',
        industry: 'News Media',
        location: 'New York, USA',
        niche: 'Politics'
      },
      {
        department: 'Business',
        position: 'Business Correspondent',
        name: 'Michael Chen',
        gender: 'Male',
        email: 'michael.chen@businessweekly.com',
        whatsapp: '+1-555-0456',
        publication: 'Business Weekly',
        industry: 'Business Media',
        location: 'London, UK',
        niche: 'Finance'
      },
      {
        department: 'Technology',
        position: 'Tech Journalist',
        name: 'Emma Wilson',
        gender: 'Female',
        email: 'emma.wilson@techreview.com',
        whatsapp: '+44-20-7946-0123',
        publication: 'Tech Review',
        industry: 'Technology Media',
        location: 'San Francisco, USA',
        niche: 'AI & Machine Learning'
      },
      {
        department: 'Entertainment',
        position: 'Entertainment Reporter',
        name: 'Carlos Rodriguez',
        gender: 'Male',
        email: 'carlos.rodriguez@entertainmenttoday.com',
        whatsapp: '+1-555-0789',
        publication: 'Entertainment Today',
        industry: 'Entertainment Media',
        location: 'Los Angeles, USA',
        niche: 'Celebrity News'
      },
      {
        department: 'Sports',
        position: 'Sports Writer',
        name: 'James Mitchell',
        gender: 'Male',
        email: 'james.mitchell@sportsnews.com',
        whatsapp: '+61-412-345-678',
        publication: 'Sports News',
        industry: 'Sports Media',
        location: 'Sydney, Australia',
        niche: 'Football'
      }
    ];

    return reporters;
  }

  buildReporterData(reporter) {
    return {
      function_department: reporter.department,
      position: reporter.position,
      name: reporter.name,
      gender: reporter.gender,
      email: reporter.email,
      whatsapp: reporter.whatsapp,
      publication_name: reporter.publication,
      website_url: `https://www.${reporter.publication.toLowerCase().replace(/\s+/g, '')}.com`,
      linkedin: `https://linkedin.com/in/${reporter.name.toLowerCase().replace(/\s+/g, '')}`,
      instagram: `https://instagram.com/${reporter.name.toLowerCase().replace(/\s+/g, '')}`,
      facebook: `https://facebook.com/${reporter.name.toLowerCase().replace(/\s+/g, '')}`,
      publication_industry: reporter.industry,
      publication_location: reporter.location,
      niche_industry: reporter.niche,
      minimum_expectation_usd: Math.floor(Math.random() * 500) + 100, // $100-600
      articles_per_month: Math.floor(Math.random() * 20) + 5, // 5-25 articles
      turnaround_time: `${Math.floor(Math.random() * 7) + 1} days`,
      company_allowed_in_title: Math.random() > 0.5,
      individual_allowed_in_title: Math.random() > 0.5,
      subheading_allowed: Math.random() > 0.3,
      sample_url: `https://www.${reporter.publication.toLowerCase().replace(/\s+/g, '')}.com/sample-article`,
      will_change_wordings: Math.random() > 0.5,
      article_placed_permanently: Math.random() > 0.7,
      article_can_be_deleted: Math.random() > 0.8,
      article_can_be_modified: Math.random() > 0.6,
      terms_accepted: true,
      how_heard_about_us: ['Google Search', 'Referral', 'Social Media'][Math.floor(Math.random() * 3)],
      message: `Experienced ${reporter.position} with expertise in ${reporter.niche}. Looking forward to contributing quality content.`,
      status: 'approved',
      submitted_by: 1
    };
  }

  async saveReporter(reporterData) {
    // Check if reporter already exists
    const existing = await this.findReporterByEmail(reporterData.email);
    if (existing) {
      console.log(`Reporter ${reporterData.email} already exists, skipping...`);
      return;
    }

    await Reporter.create(reporterData);
  }

  async findReporterByEmail(email) {
    try {
      const sql = 'SELECT * FROM reporters WHERE email = $1';
      const result = await require('./src/config/database').query(sql, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing reporter:', error);
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
  const populator = new ReporterPopulator();
  populator.populateReporters()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = ReporterPopulator;