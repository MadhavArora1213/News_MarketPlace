const dotenv = require('dotenv');
dotenv.config();

const PublicationPopulator = require('./populate_publications');
const WebsitePopulator = require('./populate_websites');
const AwardPopulator = require('./populate_awards');
const PowerListPopulator = require('./populate_powerlists');
const PublishedWorksPopulator = require('./populate_published_works');
const AgencyPopulator = require('./populate_agencies');
const EventPopulator = require('./populate_events');
const PressPackPopulator = require('./populate_press_packs');
const EventEnquiryPopulator = require('./populate_event_enquiries');
const AffiliateEnquiryPopulator = require('./populate_affiliate_enquiries');
const CareerPopulator = require('./populate_careers');
const RadioPopulator = require('./populate_radio');
const PaparazziPopulator = require('./populate_paparazzi');
const ReporterPopulator = require('./populate_reporters');
const RealEstatePopulator = require('./populate_real_estate');
const ThemePopulator = require('./populate_themes');

const scripts = [
  { name: 'publications', module: PublicationPopulator, method: 'populatePublications', isFunction: true },
  { name: 'websites', module: WebsitePopulator, method: 'populateWebsites', isFunction: true },
  { name: 'awards', module: AwardPopulator, method: 'populateAwards', isFunction: true },
  { name: 'powerlists', module: PowerListPopulator, method: 'populatePowerLists', isFunction: false },
  { name: 'published_works', module: PublishedWorksPopulator, method: 'populatePublishedWorks', isFunction: false },
  { name: 'agencies', module: AgencyPopulator, method: 'populateAgencies', isFunction: false },
  { name: 'events', module: EventPopulator, method: 'populateEvents', isFunction: false },
  { name: 'press_packs', module: PressPackPopulator, method: 'populatePressPacks', isFunction: false },
  { name: 'event_enquiries', module: EventEnquiryPopulator, method: 'populateEventEnquiries', isFunction: false },
  { name: 'affiliate_enquiries', module: AffiliateEnquiryPopulator, method: 'populateAffiliateEnquiries', isFunction: false },
  { name: 'careers', module: CareerPopulator, method: 'populateCareers', isFunction: false },
  { name: 'radio', module: RadioPopulator, method: 'populateRadios', isFunction: false },
  { name: 'paparazzi', module: PaparazziPopulator, method: 'populatePaparazzi', isFunction: false },
  { name: 'reporters', module: ReporterPopulator, method: 'populateReporters', isFunction: false },
  { name: 'real_estate', module: RealEstatePopulator, method: 'populateRealEstate', isFunction: false },
  { name: 'themes', module: ThemePopulator, method: 'populateThemes', isFunction: false }
];

async function runScripts(scriptsToRun) {
  console.log('Starting master population script...\n');

  for (const script of scriptsToRun) {
    try {
      console.log(`--- Starting ${script.name} population ---`);
      const startTime = Date.now();

      if (script.isFunction) {
        // Function-based script
        await script.module[script.method]();
      } else {
        // Class-based script
        const instance = new script.module();
        await instance[script.method]();
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`--- Completed ${script.name} population in ${duration}s ---\n`);
    } catch (error) {
      console.error(`Error in ${script.name} population:`, error.message);
      console.error(`--- Failed ${script.name} population ---\n`);
    }
  }

  console.log('Master population script finished.');
}

function parseArguments() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--all')) {
    return scripts;
  }

  const scriptNames = args.filter(arg => arg.startsWith('--')).map(arg => arg.slice(2));
  return scripts.filter(script => scriptNames.includes(script.name));
}

function showUsage() {
  console.log('Usage: node master_populate.js [--all] [--publications] [--websites] [--awards] [--powerlists] [--published_works] [--agencies] [--events] [--press_packs] [--event_enquiries] [--affiliate_enquiries] [--careers] [--radio] [--paparazzi] [--reporters] [--real_estate] [--themes]');
  console.log('Examples:');
  console.log('  node master_populate.js --all');
  console.log('  node master_populate.js --agencies --events --press_packs');
  console.log('  node master_populate.js  # runs all by default');
}

// Main execution
if (require.main === module) {
  const scriptsToRun = parseArguments();

  if (scriptsToRun.length === 0) {
    console.log('No valid scripts specified.');
    showUsage();
    process.exit(1);
  }

  console.log(`Running scripts: ${scriptsToRun.map(s => s.name).join(', ')}\n`);

  runScripts(scriptsToRun)
    .then(() => {
      console.log('All scripts completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Master script failed:', error);
      process.exit(1);
    });
}

module.exports = { runScripts, scripts };