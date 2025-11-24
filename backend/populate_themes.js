const Theme = require('./src/models/Theme');

class ThemePopulator {
  constructor() {
    this.processedThemes = new Set();
  }

  async populateThemes() {
    try {
      console.log('Starting theme population...');

      const themes = this.generateSampleThemes();
      let totalSuccess = 0;
      let totalError = 0;

      for (const theme of themes) {
        try {
          const themeData = this.buildThemeData(theme);
          await this.saveTheme(themeData);

          totalSuccess++;
          console.log(`Saved theme: ${theme.page_name}`);

          // Small delay
          await this.delay(500);
        } catch (error) {
          console.error(`Error processing theme ${theme.page_name}:`, error.message);
          totalError++;
        }
      }

      console.log(`\nPopulation complete. Success: ${totalSuccess}, Errors: ${totalError}`);

    } catch (error) {
      console.error('Error in populateThemes:', error);
    }
  }

  generateSampleThemes() {
    const themes = [
      {
        username: 'nature_lover',
        page_name: 'Nature & Wildlife Themes',
        followers: 50000,
        collaboration: 'Nature photography and environmental themes',
        category: 'Nature',
        location: 'Vancouver, Canada',
        platform: 'Instagram'
      },
      {
        username: 'urban_explorer',
        page_name: 'Urban Lifestyle',
        followers: 75000,
        collaboration: 'City life and urban culture content',
        category: 'Urban',
        location: 'New York, NY',
        platform: 'Instagram'
      },
      {
        username: 'foodie_delights',
        page_name: 'Culinary Adventures',
        followers: 120000,
        collaboration: 'Food photography and restaurant reviews',
        category: 'Food',
        location: 'San Francisco, CA',
        platform: 'Instagram'
      },
      {
        username: 'fitness_motivation',
        page_name: 'Fit & Healthy Living',
        followers: 200000,
        collaboration: 'Fitness tips and healthy lifestyle content',
        category: 'Fitness',
        location: 'Los Angeles, CA',
        platform: 'Instagram'
      },
      {
        username: 'tech_gadgets',
        page_name: 'Tech & Innovation',
        followers: 95000,
        collaboration: 'Latest technology and gadget reviews',
        category: 'Technology',
        location: 'Seattle, WA',
        platform: 'Instagram'
      }
    ];

    return themes;
  }

  buildThemeData(theme) {
    // Generate pricing based on followers
    const basePrice = Math.floor(theme.followers / 1000) * 5; // $5 per 1K followers

    return {
      platform: theme.platform,
      username: theme.username,
      page_name: theme.page_name,
      no_of_followers: theme.followers,
      collaboration: theme.collaboration,
      category: theme.category,
      location: theme.location,
      price_reel_without_tagging_collaboration: basePrice * 0.5,
      price_reel_with_tagging_collaboration: basePrice * 0.75,
      price_reel_with_tagging: basePrice,
      video_minute_allowed: Math.floor(Math.random() * 3) + 1, // 1-3 minutes
      pin_post_charges_week: basePrice * 1.5,
      story_charges: basePrice * 0.2,
      story_with_reel_charges: basePrice * 0.4,
      page_website: `https://www.${theme.username}.com`,
      status: 'approved',
      submitted_by: 1
    };
  }

  async saveTheme(themeData) {
    // Check if theme already exists
    const existing = await this.findThemeByUsername(themeData.username);
    if (existing) {
      console.log(`Theme ${themeData.username} already exists, skipping...`);
      return;
    }

    await Theme.create(themeData);
  }

  async findThemeByUsername(username) {
    try {
      const sql = 'SELECT * FROM themes WHERE username = $1';
      const result = await require('./src/config/database').query(sql, [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing theme:', error);
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
  const populator = new ThemePopulator();
  populator.populateThemes()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = ThemePopulator;