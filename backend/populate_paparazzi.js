const Paparazzi = require('./src/models/Paparazzi');

class PaparazziPopulator {
  constructor() {
    this.processedPaparazzi = new Set();
  }

  async populatePaparazzi() {
    try {
      console.log('Starting paparazzi population...');

      const paparazzi = this.generateSamplePaparazzi();
      let totalSuccess = 0;
      let totalError = 0;

      for (const p of paparazzi) {
        try {
          const paparazziData = this.buildPaparazziData(p);
          await this.savePaparazzi(paparazziData);

          totalSuccess++;
          console.log(`Saved paparazzi: ${p.page_name}`);

          // Small delay
          await this.delay(500);
        } catch (error) {
          console.error(`Error processing paparazzi ${p.page_name}:`, error.message);
          totalError++;
        }
      }

      console.log(`\nPopulation complete. Success: ${totalSuccess}, Errors: ${totalError}`);

    } catch (error) {
      console.error('Error in populatePaparazzi:', error);
    }
  }

  generateSamplePaparazzi() {
    const paparazzi = [
      {
        username: 'celebrity_shots',
        page_name: 'Celebrity Shots Pro',
        followers: 150000,
        collaboration: 'Available for celebrity events and red carpet coverage',
        category: 'Celebrity Photography',
        location: 'Los Angeles, CA',
        platform: 'Instagram'
      },
      {
        username: 'hollywood_paparazzi',
        page_name: 'Hollywood Paparazzi',
        followers: 200000,
        collaboration: 'Specializing in Hollywood celebrity photography',
        category: 'Entertainment',
        location: 'Beverly Hills, CA',
        platform: 'Instagram'
      },
      {
        username: 'redcarpet_photos',
        page_name: 'Red Carpet Photos',
        followers: 95000,
        collaboration: 'Award shows and premiere photography',
        category: 'Event Photography',
        location: 'New York, NY',
        platform: 'Instagram'
      },
      {
        username: 'star_gazer_pro',
        page_name: 'Star Gazer Pro',
        followers: 75000,
        collaboration: 'Celebrity lifestyle and candid shots',
        category: 'Lifestyle Photography',
        location: 'Miami, FL',
        platform: 'Instagram'
      },
      {
        username: 'fame_captures',
        page_name: 'Fame Captures',
        followers: 120000,
        collaboration: 'High-profile celebrity events',
        category: 'Celebrity Photography',
        location: 'Las Vegas, NV',
        platform: 'Instagram'
      },
      {
        username: 'glitz_glamour',
        page_name: 'Glitz & Glamour',
        followers: 85000,
        collaboration: 'Luxury lifestyle and celebrity fashion',
        category: 'Fashion Photography',
        location: 'Paris, France',
        platform: 'Instagram'
      },
      {
        username: 'celebrity_lens',
        page_name: 'Celebrity Lens',
        followers: 110000,
        collaboration: 'Professional celebrity portraiture',
        category: 'Portrait Photography',
        location: 'London, UK',
        platform: 'Instagram'
      },
      {
        username: 'starlight_photos',
        page_name: 'Starlight Photos',
        followers: 65000,
        collaboration: 'Nightlife and celebrity events',
        category: 'Event Photography',
        location: 'Ibiza, Spain',
        platform: 'Instagram'
      },
      {
        username: 'famous_faces',
        page_name: 'Famous Faces',
        followers: 135000,
        collaboration: 'Celebrity interviews and photo shoots',
        category: 'Celebrity Photography',
        location: 'Sydney, Australia',
        platform: 'Instagram'
      },
      {
        username: 'paparazzi_pro',
        page_name: 'Paparazzi Pro Network',
        followers: 180000,
        collaboration: 'International celebrity coverage',
        category: 'Photojournalism',
        location: 'Dubai, UAE',
        platform: 'Instagram'
      }
    ];

    return paparazzi;
  }

  buildPaparazziData(p) {
    // Generate pricing based on followers
    const basePrice = Math.floor(p.followers / 1000) * 10; // $10 per 1K followers

    return {
      platform: p.platform,
      username: p.username,
      page_name: p.page_name,
      followers_count: p.followers,
      collaboration: p.collaboration,
      category: p.category,
      location: p.location,
      price_reel_no_tag_no_collab: basePrice * 0.5,
      price_reel_with_tag_no_collab: basePrice * 0.75,
      price_reel_with_tag: basePrice,
      video_minutes_allowed: Math.floor(Math.random() * 5) + 1, // 1-5 minutes
      pin_post_weekly_charge: basePrice * 2,
      story_charge: basePrice * 0.3,
      story_with_reel_charge: basePrice * 0.6,
      page_website: `https://www.${p.username}.com`,
      status: 'approved',
      user_id: 1 // Assuming admin user
    };
  }

  async savePaparazzi(paparazziData) {
    // Check if paparazzi already exists
    const existing = await this.findPaparazziByUsername(paparazziData.username);
    if (existing) {
      console.log(`Paparazzi ${paparazziData.username} already exists, skipping...`);
      return;
    }

    await Paparazzi.create(paparazziData);
  }

  async findPaparazziByUsername(username) {
    try {
      const sql = 'SELECT * FROM paparazzi WHERE username = $1';
      const result = await require('./src/config/database').query(sql, [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing paparazzi:', error);
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
  const populator = new PaparazziPopulator();
  populator.populatePaparazzi()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = PaparazziPopulator;