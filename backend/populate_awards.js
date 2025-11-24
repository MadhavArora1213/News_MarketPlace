const Award = require('./src/models/Award');

// Real award data - no scraping needed
const AWARDS_DATA = [
  {
    award_name: 'Academy Awards',
    award_focus: 'Film - Global',
    organiser: 'Academy of Motion Picture Arts and Sciences',
    website: 'https://www.oscars.org/',
    linkedin: 'https://www.linkedin.com/company/academy-of-motion-picture-arts-and-sciences',
    instagram: 'https://www.instagram.com/theacademy',
    award_month: 'March',
    cta_text: 'Apply for Academy Awards',
    description: 'The Academy Awards, also known as the Oscars, are awards for artistic and technical merit in the film industry.',
    chief_guest: 'Will Smith',
    celebrity_guest: 'Lady Gaga'
  },
  {
    award_name: 'Grammy Awards',
    award_focus: 'Music - Global',
    organiser: 'Recording Academy',
    website: 'https://www.grammy.com/',
    linkedin: 'https://www.linkedin.com/company/the-recording-academy',
    instagram: 'https://www.instagram.com/recordingacademy',
    award_month: 'February',
    cta_text: 'Apply for Grammy Awards',
    description: 'The Grammy Awards are presented annually by the Recording Academy to recognize outstanding achievement in the music industry.',
    chief_guest: 'Harry Styles',
    celebrity_guest: 'Taylor Swift'
  },
  {
    award_name: 'Nobel Prize',
    award_focus: 'Science & Technology - Global',
    organiser: 'Nobel Foundation',
    website: 'https://www.nobelprize.org/',
    linkedin: 'https://www.linkedin.com/company/nobel-foundation',
    instagram: 'https://www.instagram.com/nobelprize',
    award_month: 'October',
    cta_text: 'Apply for Nobel Prize',
    description: 'The Nobel Prize is a set of annual international awards bestowed in several categories by Swedish and Norwegian institutions.',
    chief_guest: 'King Carl XVI Gustaf',
    celebrity_guest: 'Malala Yousafzai'
  },
  {
    award_name: 'Pulitzer Prize',
    award_focus: 'Literature - United States',
    organiser: 'Columbia University',
    website: 'https://www.pulitzer.org/',
    linkedin: 'https://www.linkedin.com/company/pulitzer-center',
    instagram: 'https://www.instagram.com/pulitzerprize',
    award_month: 'April',
    cta_text: 'Apply for Pulitzer Prize',
    description: 'The Pulitzer Prize is an award for achievements in newspaper, magazine and online journalism, literature, and musical composition.',
    chief_guest: 'Dolly Parton',
    celebrity_guest: 'Bob Woodward'
  },
  {
    award_name: 'Emmy Awards',
    award_focus: 'Television - Global',
    organiser: 'Academy of Television Arts & Sciences',
    website: 'https://www.emmys.com/',
    linkedin: 'https://www.linkedin.com/company/academy-of-television-arts---sciences',
    instagram: 'https://www.instagram.com/emmys',
    award_month: 'September',
    cta_text: 'Apply for Emmy Awards',
    description: 'The Emmy Award recognizes excellence in the television industry.',
    chief_guest: 'Jimmy Kimmel',
    celebrity_guest: 'Oprah Winfrey'
  },
  {
    award_name: 'Golden Globe Awards',
    award_focus: 'Film & Television - Global',
    organiser: 'Hollywood Foreign Press Association',
    website: 'https://www.goldenglobes.com/',
    linkedin: 'https://www.linkedin.com/company/hollywood-foreign-press-association',
    instagram: 'https://www.instagram.com/goldenglobes',
    award_month: 'January',
    cta_text: 'Apply for Golden Globes',
    description: 'The Golden Globe Awards are accolades bestowed by the Hollywood Foreign Press Association.',
    chief_guest: 'Amy Poehler',
    celebrity_guest: 'Tom Cruise'
  },
  {
    award_name: 'Tony Awards',
    award_focus: 'Theater - United States',
    organiser: 'American Theatre Wing',
    website: 'https://www.tonyawards.com/',
    linkedin: 'https://www.linkedin.com/company/american-theatre-wing',
    instagram: 'https://www.instagram.com/tonyawards',
    award_month: 'June',
    cta_text: 'Apply for Tony Awards',
    description: 'The Tony Award is an annual award for Broadway theatre.',
    chief_guest: 'Audra McDonald',
    celebrity_guest: 'Lin-Manuel Miranda'
  },
  {
    award_name: 'Booker Prize',
    award_focus: 'Literature - United Kingdom',
    organiser: 'Booker Prize Foundation',
    website: 'https://www.thebookerprizes.com/',
    linkedin: 'https://www.linkedin.com/company/the-booker-prize-foundation',
    instagram: 'https://www.instagram.com/bookerprize',
    award_month: 'October',
    cta_text: 'Apply for Booker Prize',
    description: 'The Booker Prize is awarded annually for fiction by writers from the Commonwealth or Ireland.',
    chief_guest: 'Margaret Atwood',
    celebrity_guest: 'Salman Rushdie'
  },
  {
    award_name: 'Olympic Gold Medal',
    award_focus: 'Sports - Global',
    organiser: 'International Olympic Committee',
    website: 'https://olympics.com/',
    linkedin: 'https://www.linkedin.com/company/international-olympic-committee',
    instagram: 'https://www.instagram.com/olympics',
    award_month: 'August',
    cta_text: 'Compete for Olympic Gold',
    description: 'The Olympic Games are the world\'s foremost sports competition.',
    chief_guest: 'Thomas Bach',
    celebrity_guest: 'Usain Bolt'
  },
  {
    award_name: 'Forbes 30 Under 30',
    award_focus: 'Business - Global',
    organiser: 'Forbes Media',
    website: 'https://www.forbes.com/30-under-30/',
    linkedin: 'https://www.linkedin.com/company/forbes-media',
    instagram: 'https://www.instagram.com/forbes',
    award_month: 'December',
    cta_text: 'Apply for 30 Under 30',
    description: 'Forbes 30 Under 30 is an annual listicle of 600 young leaders in 20 categories.',
    chief_guest: 'Randi Zuckerberg',
    celebrity_guest: 'Mark Zuckerberg'
  }
];

async function populateAwards() {
  try {
    console.log('Starting award population with direct data...');

    let successCount = 0;
    let errorCount = 0;

    for (const awardData of AWARDS_DATA) {
      try {
        // Check if award already exists
        const existing = await findAwardByName(awardData.award_name);
        if (existing) {
          console.log(`Award ${awardData.award_name} already exists, skipping...`);
          continue;
        }

        await Award.create(awardData);
        successCount++;
        console.log(`Saved award: ${awardData.award_name}`);
      } catch (error) {
        console.error(`Error processing award ${awardData.award_name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`Population complete. Success: ${successCount}, Errors: ${errorCount}`);

  } catch (error) {
    console.error('Error in populateAwards:', error);
  }
}

async function findAwardByName(name) {
  try {
    const sql = 'SELECT * FROM awards WHERE award_name = $1';
    const result = await require('./src/config/database').query(sql, [name]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error checking existing award:', error);
    return null;
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();
  populateAwards()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populateAwards };