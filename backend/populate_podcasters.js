const axios = require('axios');

// Import the Podcaster model
let Podcaster;
try {
  Podcaster = require('./src/models/Podcaster');
  console.log('Podcaster model loaded successfully');
} catch (error) {
  console.error('Failed to load Podcaster model:', error.message);
  process.exit(1);
}

class PodcasterPopulator {
  constructor() {
    this.processedPodcasters = new Set();
  }

  async populatePodcasters() {
    try {
      console.log('Starting podcaster population from Apple Podcasts...');

      // Fetch popular podcasts from Apple Podcasts API
      const podcasts = await this.fetchPodcastsFromApple();
      console.log(`Found ${podcasts.length} podcasts`);

      let successCount = 0;
      let errorCount = 0;

      for (const podcast of podcasts) {
        try {
          // Check if already processed
          if (this.processedPodcasters.has(podcast.collectionName.toLowerCase())) {
            console.log(`Skipping already processed podcast: ${podcast.collectionName}`);
            continue;
          }

          const podcasterData = await this.buildPodcasterData(podcast);
          if (podcasterData) {
            const saved = await this.savePodcaster(podcasterData);
            if (saved) {
              this.processedPodcasters.add(podcast.collectionName.toLowerCase());
              successCount++;
              console.log(`Saved podcaster: ${podcast.collectionName}`);
            } else {
              errorCount++;
            }
          } else {
            console.log(`Failed to build podcaster data for: ${podcast.collectionName}`);
            errorCount++;
          }

          // Delay to avoid rate limiting
          await this.delay(1000);
        } catch (error) {
          console.error(`Error processing podcast ${podcast.collectionName}:`, error.message);
          errorCount++;
        }
      }

      console.log(`\nPodcaster population complete. Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error('Error in populatePodcasters:', error);
      throw error; // Re-throw to be caught by caller
    }
  }

  async fetchPodcastsFromApple() {
    try {
      // Search for popular podcasts
      const searchTerms = ['business', 'technology', 'entertainment', 'news'];
      const allPodcasts = [];

      for (const term of searchTerms) {
        try {
          const response = await axios.get('https://itunes.apple.com/search', {
            params: {
              term: term,
              entity: 'podcast',
              limit: 5,
              country: 'US'
            },
            timeout: 10000
          });

          if (response.data && response.data.results) {
            allPodcasts.push(...response.data.results);
            console.log(`Fetched ${response.data.results.length} podcasts for term: ${term}`);
          }

          await this.delay(500);
        } catch (error) {
          console.error(`Error fetching podcasts for term ${term}:`, error.message);
          // Continue with other terms even if one fails
        }
      }

      // Remove duplicates and limit to 3
      const uniquePodcasts = allPodcasts.filter((podcast, index, self) =>
        index === self.findIndex(p => p.collectionId === podcast.collectionId)
      );

      return uniquePodcasts.slice(0, 3);

    } catch (error) {
      console.error('Error fetching podcasts from Apple:', error.message);
      return [];
    }
  }

  async buildPodcasterData(podcast) {
    try {
      // Validate required podcast data
      if (!podcast.collectionName || !podcast.collectionId) {
        console.log(`Skipping podcast with missing required data: ${podcast.collectionName || 'Unknown'}`);
        return null;
      }

      // Generate random data for missing fields
      const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
      const nationalities = ['American', 'British', 'Canadian', 'Australian'];
      const regions = ['North America', 'Europe', 'Asia', 'Global'];
      const industries = ['Technology', 'Business', 'Entertainment', 'News', 'Health', 'Education'];

      const hostName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const igFollowers = Math.floor(Math.random() * 50000) + 10000;
      const engagementRate = parseFloat((Math.random() * 5 + 1).toFixed(2));

      // Clean podcast name for URLs
      const cleanName = podcast.collectionName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Ensure all required fields are present and valid
      const podcasterData = {
        podcast_name: podcast.collectionName,
        podcast_host: hostName,
        podcast_focus_industry: industries[Math.floor(Math.random() * industries.length)],
        podcast_target_audience: 'General public',
        podcast_region: regions[Math.floor(Math.random() * regions.length)],
        podcast_website: podcast.collectionViewUrl || `https://podcasts.apple.com/podcast/${cleanName}`,
        podcast_ig: `https://instagram.com/${cleanName}`,
        podcast_linkedin: `https://linkedin.com/company/${cleanName}`,
        podcast_facebook: `https://facebook.com/${cleanName}`,
        podcast_ig_username: `@${cleanName}`,
        podcast_ig_followers: igFollowers,
        podcast_ig_engagement_rate: engagementRate,
        podcast_ig_prominent_guests: 'Various industry experts',
        spotify_channel_name: podcast.collectionName,
        spotify_channel_url: `https://open.spotify.com/show/${podcast.collectionId}`,
        youtube_channel_name: `${podcast.collectionName} Official`,
        youtube_channel_url: `https://youtube.com/c/${cleanName}`,
        tiktok: `https://tiktok.com/@${cleanName}`,
        cta: 'Subscribe to our podcast for the latest insights!',
        contact_us_to_be_on_podcast: 'Email us at contact@podcast.com',
        gender: Math.random() > 0.5 ? 'male' : 'female',
        nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
        status: 'approved',
        submitted_by_admin: 1, // Assuming admin ID 1 exists
        is_active: true
      };

      // Validate critical fields before returning
      if (!podcasterData.podcast_name || podcasterData.podcast_name.trim().length === 0) {
        console.log(`Invalid podcast name for: ${podcast.collectionName}`);
        return null;
      }

      if (typeof podcasterData.podcast_ig_followers !== 'number' || podcasterData.podcast_ig_followers < 0) {
        console.log(`Invalid IG followers for: ${podcast.collectionName}`);
        return null;
      }

      if (typeof podcasterData.podcast_ig_engagement_rate !== 'number' ||
          podcasterData.podcast_ig_engagement_rate < 0 ||
          podcasterData.podcast_ig_engagement_rate > 100) {
        console.log(`Invalid engagement rate for: ${podcast.collectionName}`);
        return null;
      }

      return podcasterData;
    } catch (error) {
      console.error(`Error building podcaster data for ${podcast.collectionName}:`, error.message);
      return null;
    }
  }

  async savePodcaster(podcasterData) {
    try {
      // Check if podcaster already exists
      const existing = await this.findPodcasterByName(podcasterData.podcast_name);
      if (existing) {
        console.log(`Podcaster ${podcasterData.podcast_name} already exists, skipping...`);
        return false;
      }

      // Create the podcaster using the model
      const podcaster = await Podcaster.create(podcasterData);
      console.log(`Successfully created podcaster: ${podcaster.podcast_name} (ID: ${podcaster.id})`);
      return true;
    } catch (error) {
      if (error.message.includes('Validation errors')) {
        console.error(`Validation failed for podcaster ${podcasterData.podcast_name}:`, error.message);
      } else {
        console.error(`Database error saving podcaster ${podcasterData.podcast_name}:`, error.message);
      }
      return false;
    }
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
  require('dotenv').config();
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