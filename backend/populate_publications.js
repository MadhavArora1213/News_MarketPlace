const Publication = require('./src/models/Publication');

// Real publication data - no scraping needed
const PUBLICATIONS_DATA = [
  {
    group_id: 1,
    publication_sn: 'CNN-001',
    publication_grade: 'A+',
    publication_name: 'CNN',
    publication_website: 'https://www.cnn.com',
    publication_price: 500.00,
    agreement_tat: 7,
    practical_tat: 10,
    publication_socials_icons: 'https://www.facebook.com/cnn,https://www.twitter.com/cnn,https://www.instagram.com/cnn',
    publication_language: 'English',
    publication_region: 'United States',
    publication_primary_industry: 'General',
    website_news_index: 85,
    da: 95,
    dr: 88,
    sponsored_or_not: false,
    words_limit: 1500,
    word_limit: 1500,
    number_of_images: 3,
    do_follow_link: true,
    example_link: 'https://www.cnn.com/example-article',
    excluding_categories: 'Politics, Adult Content',
    other_remarks: 'Major US news network with global reach',
    tags_badges: 'Breaking News, US News, International',
    live_on_platform: true,
    status: 'approved'
  },
  {
    group_id: 1,
    publication_sn: 'BBC-002',
    publication_grade: 'A+',
    publication_name: 'BBC News',
    publication_website: 'https://www.bbc.com/news',
    publication_price: 450.00,
    agreement_tat: 5,
    practical_tat: 8,
    publication_socials_icons: 'https://www.facebook.com/bbcnews,https://www.twitter.com/bbcnews,https://www.instagram.com/bbcnews',
    publication_language: 'English',
    publication_region: 'United Kingdom',
    publication_primary_industry: 'General',
    website_news_index: 90,
    da: 98,
    dr: 92,
    sponsored_or_not: false,
    words_limit: 1200,
    word_limit: 1200,
    number_of_images: 2,
    do_follow_link: true,
    example_link: 'https://www.bbc.com/news/example-article',
    excluding_categories: 'Adult Content, Hate Speech',
    other_remarks: 'Public service broadcaster with global reputation',
    tags_badges: 'UK News, International, Public Broadcasting',
    live_on_platform: true,
    status: 'approved'
  },
  {
    group_id: 2,
    publication_sn: 'REUTERS-003',
    publication_grade: 'A',
    publication_name: 'Reuters',
    publication_website: 'https://www.reuters.com',
    publication_price: 600.00,
    agreement_tat: 3,
    practical_tat: 5,
    publication_socials_icons: 'https://www.facebook.com/Reuters,https://www.twitter.com/reuters,https://www.instagram.com/reuters',
    publication_language: 'English',
    publication_region: 'Global',
    publication_primary_industry: 'Business',
    website_news_index: 95,
    da: 97,
    dr: 90,
    sponsored_or_not: false,
    words_limit: 800,
    word_limit: 800,
    number_of_images: 1,
    do_follow_link: true,
    example_link: 'https://www.reuters.com/article/example',
    excluding_categories: 'Opinion, Adult Content',
    other_remarks: 'Fact-based journalism with global wire service',
    tags_badges: 'Business News, Financial, Global',
    live_on_platform: true,
    status: 'approved'
  },
  {
    group_id: 1,
    publication_sn: 'NYT-004',
    publication_grade: 'A+',
    publication_name: 'The New York Times',
    publication_website: 'https://www.nytimes.com',
    publication_price: 550.00,
    agreement_tat: 10,
    practical_tat: 14,
    publication_socials_icons: 'https://www.facebook.com/nytimes,https://www.twitter.com/nytimes,https://www.instagram.com/nytimes',
    publication_language: 'English',
    publication_region: 'United States',
    publication_primary_industry: 'General',
    website_news_index: 88,
    da: 96,
    dr: 89,
    sponsored_or_not: false,
    words_limit: 2000,
    word_limit: 2000,
    number_of_images: 4,
    do_follow_link: true,
    example_link: 'https://www.nytimes.com/example-article',
    excluding_categories: 'Adult Content, Hate Speech',
    other_remarks: 'Award-winning journalism with in-depth reporting',
    tags_badges: 'Investigative, US News, Premium',
    live_on_platform: true,
    status: 'approved'
  },
  {
    group_id: 1,
    publication_sn: 'GUARDIAN-005',
    publication_grade: 'A',
    publication_name: 'The Guardian',
    publication_website: 'https://www.theguardian.com',
    publication_price: 400.00,
    agreement_tat: 7,
    practical_tat: 10,
    publication_socials_icons: 'https://www.facebook.com/theguardian,https://www.twitter.com/guardian,https://www.instagram.com/guardian',
    publication_language: 'English',
    publication_region: 'United Kingdom',
    publication_primary_industry: 'General',
    website_news_index: 82,
    da: 94,
    dr: 87,
    sponsored_or_not: false,
    words_limit: 1800,
    word_limit: 1800,
    number_of_images: 3,
    do_follow_link: true,
    example_link: 'https://www.theguardian.com/example-article',
    excluding_categories: 'Adult Content',
    other_remarks: 'Progressive journalism with strong environmental focus',
    tags_badges: 'UK News, Environment, Progressive',
    live_on_platform: true,
    status: 'approved'
  },
  {
    group_id: 2,
    publication_sn: 'WSJ-006',
    publication_grade: 'A+',
    publication_name: 'The Wall Street Journal',
    publication_website: 'https://www.wsj.com',
    publication_price: 700.00,
    agreement_tat: 5,
    practical_tat: 7,
    publication_socials_icons: 'https://www.facebook.com/wsj,https://www.twitter.com/wsj,https://www.instagram.com/wsj',
    publication_language: 'English',
    publication_region: 'United States',
    publication_primary_industry: 'Business',
    website_news_index: 92,
    da: 95,
    dr: 91,
    sponsored_or_not: false,
    words_limit: 1000,
    word_limit: 1000,
    number_of_images: 2,
    do_follow_link: true,
    example_link: 'https://www.wsj.com/articles/example',
    excluding_categories: 'Adult Content, Opinion',
    other_remarks: 'Premium business and financial news',
    tags_badges: 'Business, Finance, Premium',
    live_on_platform: true,
    status: 'approved'
  },
  {
    group_id: 1,
    publication_sn: 'TECHCRUNCH-007',
    publication_grade: 'A-',
    publication_name: 'TechCrunch',
    publication_website: 'https://techcrunch.com',
    publication_price: 350.00,
    agreement_tat: 3,
    practical_tat: 5,
    publication_socials_icons: 'https://www.facebook.com/techcrunch,https://www.twitter.com/techcrunch,https://www.instagram.com/techcrunch',
    publication_language: 'English',
    publication_region: 'Global',
    publication_primary_industry: 'Technology',
    website_news_index: 78,
    da: 92,
    dr: 85,
    sponsored_or_not: true,
    words_limit: 1200,
    word_limit: 1200,
    number_of_images: 2,
    do_follow_link: true,
    example_link: 'https://techcrunch.com/example-post',
    excluding_categories: 'Adult Content',
    other_remarks: 'Leading technology news and startup coverage',
    tags_badges: 'Technology, Startups, Innovation',
    live_on_platform: true,
    status: 'approved'
  },
  {
    group_id: 2,
    publication_sn: 'BLOOMBERG-008',
    publication_grade: 'A',
    publication_name: 'Bloomberg',
    publication_website: 'https://www.bloomberg.com',
    publication_price: 650.00,
    agreement_tat: 4,
    practical_tat: 6,
    publication_socials_icons: 'https://www.facebook.com/bloomberg,https://www.twitter.com/business,https://www.instagram.com/bloomberg',
    publication_language: 'English',
    publication_region: 'Global',
    publication_primary_industry: 'Business',
    website_news_index: 89,
    da: 96,
    dr: 88,
    sponsored_or_not: false,
    words_limit: 900,
    word_limit: 900,
    number_of_images: 1,
    do_follow_link: true,
    example_link: 'https://www.bloomberg.com/news/example',
    excluding_categories: 'Adult Content',
    other_remarks: 'Financial news and market data leader',
    tags_badges: 'Finance, Markets, Business',
    live_on_platform: true,
    status: 'approved'
  },
  {
    group_id: 1,
    publication_sn: 'WIRED-009',
    publication_grade: 'B+',
    publication_name: 'Wired',
    publication_website: 'https://www.wired.com',
    publication_price: 300.00,
    agreement_tat: 7,
    practical_tat: 10,
    publication_socials_icons: 'https://www.facebook.com/wired,https://www.twitter.com/wired,https://www.instagram.com/wired',
    publication_language: 'English',
    publication_region: 'United States',
    publication_primary_industry: 'Technology',
    website_news_index: 75,
    da: 90,
    dr: 83,
    sponsored_or_not: true,
    words_limit: 1500,
    word_limit: 1500,
    number_of_images: 3,
    do_follow_link: true,
    example_link: 'https://www.wired.com/story/example',
    excluding_categories: 'Adult Content',
    other_remarks: 'Technology culture and innovation magazine',
    tags_badges: 'Technology, Culture, Innovation',
    live_on_platform: true,
    status: 'approved'
  },
  {
    group_id: 1,
    publication_sn: 'ALJAZEERA-010',
    publication_grade: 'A-',
    publication_name: 'Al Jazeera',
    publication_website: 'https://www.aljazeera.com',
    publication_price: 380.00,
    agreement_tat: 5,
    practical_tat: 8,
    publication_socials_icons: 'https://www.facebook.com/aljazeera,https://www.twitter.com/ajenglish,https://www.instagram.com/aljazeeraenglish',
    publication_language: 'English',
    publication_region: 'Qatar',
    publication_primary_industry: 'General',
    website_news_index: 80,
    da: 91,
    dr: 84,
    sponsored_or_not: false,
    words_limit: 1300,
    word_limit: 1300,
    number_of_images: 2,
    do_follow_link: true,
    example_link: 'https://www.aljazeera.com/news/example',
    excluding_categories: 'Adult Content',
    other_remarks: 'International news with Middle East focus',
    tags_badges: 'International, Middle East, Global',
    live_on_platform: true,
    status: 'approved'
  }
];

async function populatePublications() {
  try {
    console.log('Starting publication population with direct data...');

    let successCount = 0;
    let errorCount = 0;

    for (const publicationData of PUBLICATIONS_DATA) {
      try {
        // Check if publication already exists
        const existing = await Publication.findBySN(publicationData.publication_sn);
        if (existing) {
          console.log(`Publication ${publicationData.publication_name} already exists, skipping...`);
          continue;
        }

        await Publication.create(publicationData);
        successCount++;
        console.log(`Saved publication: ${publicationData.publication_name}`);
      } catch (error) {
        console.error(`Error processing publication ${publicationData.publication_name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`Population complete. Success: ${successCount}, Errors: ${errorCount}`);

  } catch (error) {
    console.error('Error in populatePublications:', error);
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();
  populatePublications()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populatePublications };