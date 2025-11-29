require('dotenv').config();
const Podcaster = require('./src/models/Podcaster');

class PodcasterPopulator {
  constructor() {
    this.processedPodcasters = new Set();
  }

  async populatePodcasters() {
    try {
      console.log('Starting podcaster population...');

      const podcasters = this.generateSamplePodcasters();
      let totalSuccess = 0;
      let totalError = 0;

      for (const podcaster of podcasters) {
        try {
          const podcasterData = this.buildPodcasterData(podcaster);
          await this.savePodcaster(podcasterData);

          totalSuccess++;
          console.log(`Saved podcaster: ${podcaster.podcast_name}`);

          // Small delay
          await this.delay(500);
        } catch (error) {
          console.error(`Error processing podcaster ${podcaster.podcast_name}:`, error.message);
          totalError++;
        }
      }

      console.log(`\nPopulation complete. Success: ${totalSuccess}, Errors: ${totalError}`);

    } catch (error) {
      console.error('Error in populatePodcasters:', error);
    }
  }

  generateSamplePodcasters() {
    const podcasters = [
      {
        podcast_name: 'The Business Hour with Ahmed',
        host_name: 'Ahmed Al-Rashid',
        industry: 'Business',
        region: 'Middle East',
        followers: 85000,
        engagement_rate: 4.2,
        nationality: 'Emirati',
        gender: 'male'
      },
      {
        podcast_name: 'Tech Talk Arabia',
        host_name: 'Sarah Khalil',
        industry: 'Technology',
        region: 'Middle East',
        followers: 120000,
        engagement_rate: 5.1,
        nationality: 'Lebanese',
        gender: 'female'
      },
      {
        podcast_name: 'Dubai Startup Stories',
        host_name: 'Omar Hassan',
        industry: 'Entrepreneurship',
        region: 'UAE',
        followers: 65000,
        engagement_rate: 3.8,
        nationality: 'Egyptian',
        gender: 'male'
      },
      {
        podcast_name: 'Women in Leadership MENA',
        host_name: 'Fatima Al-Zahra',
        industry: 'Leadership',
        region: 'Middle East',
        followers: 95000,
        engagement_rate: 4.5,
        nationality: 'Saudi Arabian',
        gender: 'female'
      },
      {
        podcast_name: 'Gulf Finance Weekly',
        host_name: 'Mohammed Al-Mansoori',
        industry: 'Finance',
        region: 'GCC',
        followers: 110000,
        engagement_rate: 4.0,
        nationality: 'Qatari',
        gender: 'male'
      },
      {
        podcast_name: 'Digital Transformation Today',
        host_name: 'Layla Abdel Rahman',
        industry: 'Digital Marketing',
        region: 'Middle East',
        followers: 78000,
        engagement_rate: 3.9,
        nationality: 'Jordanian',
        gender: 'female'
      },
      {
        podcast_name: 'Innovation Hub',
        host_name: 'Khalid Al-Otaibi',
        industry: 'Innovation',
        region: 'Saudi Arabia',
        followers: 92000,
        engagement_rate: 4.3,
        nationality: 'Saudi Arabian',
        gender: 'male'
      },
      {
        podcast_name: 'Healthcare Heroes MENA',
        host_name: 'Dr. Amina Farouk',
        industry: 'Healthcare',
        region: 'Middle East',
        followers: 105000,
        engagement_rate: 4.7,
        nationality: 'Egyptian',
        gender: 'female'
      },
      {
        podcast_name: 'Real Estate Insights Gulf',
        host_name: 'Youssef Al-Bakri',
        industry: 'Real Estate',
        region: 'GCC',
        followers: 67000,
        engagement_rate: 3.6,
        nationality: 'Kuwaiti',
        gender: 'male'
      },
      {
        podcast_name: 'Media & Communications Hub',
        host_name: 'Nour Mansour',
        industry: 'Media',
        region: 'Middle East',
        followers: 88000,
        engagement_rate: 4.1,
        nationality: 'Palestinian',
        gender: 'female'
      },
      {
        podcast_name: 'Sustainability Leaders',
        host_name: 'Rashid Al-Maktoum',
        industry: 'Sustainability',
        region: 'UAE',
        followers: 75000,
        engagement_rate: 3.7,
        nationality: 'Emirati',
        gender: 'male'
      },
      {
        podcast_name: 'EdTech Revolution',
        host_name: 'Maryam Al-Qasimi',
        industry: 'Education Technology',
        region: 'UAE',
        followers: 82000,
        engagement_rate: 4.4,
        nationality: 'Emirati',
        gender: 'female'
      },
      {
        podcast_name: 'Sports Business MENA',
        host_name: 'Hassan Al-Thani',
        industry: 'Sports Business',
        region: 'Qatar',
        followers: 94000,
        engagement_rate: 4.2,
        nationality: 'Qatari',
        gender: 'male'
      },
      {
        podcast_name: 'Fashion Forward Arabia',
        host_name: 'Lina Boutros',
        industry: 'Fashion',
        region: 'Lebanon',
        followers: 115000,
        engagement_rate: 5.0,
        nationality: 'Lebanese',
        gender: 'female'
      },
      {
        podcast_name: 'Legal Minds Gulf',
        host_name: 'Abdullah Al-Sabah',
        industry: 'Legal',
        region: 'Kuwait',
        followers: 58000,
        engagement_rate: 3.4,
        nationality: 'Kuwaiti',
        gender: 'male'
      }
    ];

    return podcasters;
  }

  buildPodcasterData(podcaster) {
    // Clean podcast name for URLs
    const cleanName = podcaster.podcast_name.toLowerCase().replace(/[^a-z0-9]/g, '');

    return {
      podcast_name: podcaster.podcast_name,
      podcast_host: podcaster.host_name,
      podcast_focus_industry: podcaster.industry,
      podcast_target_audience: `Professionals in ${podcaster.industry} and business leaders`,
      podcast_region: podcaster.region,
      podcast_website: `https://www.${cleanName}.com`,
      podcast_ig: `https://instagram.com/${cleanName}`,
      podcast_linkedin: `https://linkedin.com/company/${cleanName}`,
      podcast_facebook: `https://facebook.com/${cleanName}`,
      podcast_ig_username: `@${cleanName}`,
      podcast_ig_followers: podcaster.followers,
      podcast_ig_engagement_rate: podcaster.engagement_rate,
      podcast_ig_prominent_guests: this.generateProminentGuests(podcaster.industry),
      spotify_channel_name: podcaster.podcast_name,
      spotify_channel_url: `https://open.spotify.com/show/${cleanName}`,
      youtube_channel_name: `${podcaster.podcast_name} - Official Channel`,
      youtube_channel_url: `https://youtube.com/@${cleanName}`,
      tiktok: `https://tiktok.com/@${cleanName}`,
      cta: `Join us every week for insights into ${podcaster.industry}. Subscribe now!`,
      contact_us_to_be_on_podcast: `Email us at guest@${cleanName}.com to be featured`,
      gender: podcaster.gender,
      nationality: podcaster.nationality,
      status: 'approved',
      submitted_by_admin: 1,
      is_active: true
    };
  }

  generateProminentGuests(industry) {
    const guestsByIndustry = {
      'Business': 'CEOs from major corporations, business consultants, entrepreneurs',
      'Technology': 'Tech startup founders, CTO executives, innovation leaders',
      'Finance': 'Investment bankers, financial advisors, fintech executives',
      'Healthcare': 'Medical professionals, healthcare administrators, researchers',
      'Real Estate': 'Property developers, real estate investors, architects',
      'Media': 'Journalists, media executives, content creators',
      'Education Technology': 'EdTech founders, education ministers, academic leaders',
      'Fashion': 'Fashion designers, retail executives, style influencers',
      'Legal': 'Senior lawyers, judges, legal consultants',
      'Sports Business': 'Sports executives, athletes, sports marketers'
    };

    return guestsByIndustry[industry] || 'Industry experts and thought leaders';
  }

  async savePodcaster(podcasterData) {
    // Check if podcaster already exists
    const existing = await this.findPodcasterByName(podcasterData.podcast_name);
    if (existing) {
      console.log(`Podcaster ${podcasterData.podcast_name} already exists, skipping...`);
      return;
    }

    await Podcaster.create(podcasterData);
  }

  async findPodcasterByName(name) {
    try {
      const sql = 'SELECT * FROM podcasters WHERE podcast_name = $1';
      const result = await require('./src/config/database').query(sql, [name]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing podcaster:', error);
      return null;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the populator
if (require.main === module) {
  const populator = new PodcasterPopulator();
  populator.populatePodcasters()
    .then(() => {
      console.log('Podcaster population script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Podcaster population script failed:', error);
      process.exit(1);
    });
}

module.exports = PodcasterPopulator;