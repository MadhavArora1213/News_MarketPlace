const PressPack = require('./src/models/PressPack');

// Real press pack data - direct data entry
const PRESS_PACKS_DATA = [
  {
    distribution_package: 'Apple Inc. Press Release Package',
    region: 'USA',
    price: 850.00,
    industry: 'Technology',
    news: 'Apple Inc. is an American multinational technology company headquartered in Cupertino, California. Apple is the world\'s largest technology company by revenue, with US$394.3 billion in 2022 revenue.',
    indexed: true,
    disclaimer: 'This press release package contains information about Apple Inc. Distribution and use of this content is subject to applicable laws and regulations.',
    no_of_indexed_websites: 45,
    no_of_non_indexed_websites: 120,
    image: null,
    link: 'https://www.apple.com',
    words_limit: 1500,
    language: 'English'
  },
  {
    distribution_package: 'Microsoft Corporation Press Release Package',
    region: 'USA',
    price: 780.00,
    industry: 'Technology',
    news: 'Microsoft Corporation is an American multinational technology corporation headquartered in Redmond, Washington. Microsoft\'s best-known software products are the Windows line of operating systems.',
    indexed: true,
    disclaimer: 'This press release package contains information about Microsoft Corporation. Distribution and use of this content is subject to applicable laws and regulations.',
    no_of_indexed_websites: 42,
    no_of_non_indexed_websites: 110,
    image: null,
    link: 'https://www.microsoft.com',
    words_limit: 1400,
    language: 'English'
  },
  {
    distribution_package: 'Amazon.com Inc. Press Release Package',
    region: 'USA',
    price: 720.00,
    industry: 'Retail',
    news: 'Amazon.com, Inc. is an American multinational technology company which focuses on e-commerce, cloud computing, digital streaming, and artificial intelligence.',
    indexed: true,
    disclaimer: 'This press release package contains information about Amazon.com Inc. Distribution and use of this content is subject to applicable laws and regulations.',
    no_of_indexed_websites: 38,
    no_of_non_indexed_websites: 95,
    image: null,
    link: 'https://www.amazon.com',
    words_limit: 1300,
    language: 'English'
  },
  {
    distribution_package: 'Google LLC Press Release Package',
    region: 'USA',
    price: 800.00,
    industry: 'Technology',
    news: 'Google LLC is an American multinational technology company that specializes in Internet-related services and products, which include online advertising technologies.',
    indexed: true,
    disclaimer: 'This press release package contains information about Google LLC. Distribution and use of this content is subject to applicable laws and regulations.',
    no_of_indexed_websites: 48,
    no_of_non_indexed_websites: 135,
    image: null,
    link: 'https://www.google.com',
    words_limit: 1600,
    language: 'English'
  },
  {
    distribution_package: 'Tesla Inc. Press Release Package',
    region: 'USA',
    price: 650.00,
    industry: 'Automotive',
    news: 'Tesla, Inc. is an American electric vehicle and clean energy company based in Palo Alto, California. Tesla\'s current products include electric cars, battery energy storage from home to grid-scale.',
    indexed: true,
    disclaimer: 'This press release package contains information about Tesla Inc. Distribution and use of this content is subject to applicable laws and regulations.',
    no_of_indexed_websites: 35,
    no_of_non_indexed_websites: 85,
    image: null,
    link: 'https://www.tesla.com',
    words_limit: 1200,
    language: 'English'
  },
  {
    distribution_package: 'Meta Platforms Inc. Press Release Package',
    region: 'USA',
    price: 680.00,
    industry: 'Technology',
    news: 'Meta Platforms, Inc., doing business as Meta and formerly known as Facebook, Inc., is an American multinational technology conglomerate based in Menlo Park, California.',
    indexed: true,
    disclaimer: 'This press release package contains information about Meta Platforms Inc. Distribution and use of this content is subject to applicable laws and regulations.',
    no_of_indexed_websites: 40,
    no_of_non_indexed_websites: 100,
    image: null,
    link: 'https://www.meta.com',
    words_limit: 1250,
    language: 'English'
  },
  {
    distribution_package: 'Netflix Inc. Press Release Package',
    region: 'USA',
    price: 550.00,
    industry: 'Entertainment',
    news: 'Netflix, Inc. is an American subscription video on-demand over-the-top streaming service and production company based in Los Gatos, California.',
    indexed: true,
    disclaimer: 'This press release package contains information about Netflix Inc. Distribution and use of this content is subject to applicable laws and regulations.',
    no_of_indexed_websites: 32,
    no_of_non_indexed_websites: 75,
    image: null,
    link: 'https://www.netflix.com',
    words_limit: 1100,
    language: 'English'
  },
  {
    distribution_package: 'Walmart Inc. Press Release Package',
    region: 'USA',
    price: 480.00,
    industry: 'Retail',
    news: 'Walmart Inc. is an American multinational retail corporation that operates a chain of hypermarkets, discount department stores, and grocery stores from the United States.',
    indexed: true,
    disclaimer: 'This press release package contains information about Walmart Inc. Distribution and use of this content is subject to applicable laws and regulations.',
    no_of_indexed_websites: 28,
    no_of_non_indexed_websites: 65,
    image: null,
    link: 'https://www.walmart.com',
    words_limit: 1000,
    language: 'English'
  },
  {
    distribution_package: 'JPMorgan Chase & Co. Press Release Package',
    region: 'USA',
    price: 750.00,
    industry: 'Finance',
    news: 'JPMorgan Chase & Co. is an American multinational investment bank and financial services holding company headquartered in New York City.',
    indexed: true,
    disclaimer: 'This press release package contains information about JPMorgan Chase & Co. Distribution and use of this content is subject to applicable laws and regulations.',
    no_of_indexed_websites: 36,
    no_of_non_indexed_websites: 90,
    image: null,
    link: 'https://www.jpmorganchase.com',
    words_limit: 1350,
    language: 'English'
  },
  {
    distribution_package: 'Johnson & Johnson Press Release Package',
    region: 'USA',
    price: 620.00,
    industry: 'Healthcare',
    news: 'Johnson & Johnson is an American multinational corporation founded in 1886 that develops medical devices, pharmaceuticals and consumer packaged goods.',
    indexed: true,
    disclaimer: 'This press release package contains information about Johnson & Johnson. Distribution and use of this content is subject to applicable laws and regulations.',
    no_of_indexed_websites: 30,
    no_of_non_indexed_websites: 70,
    image: null,
    link: 'https://www.jnj.com',
    words_limit: 1150,
    language: 'English'
  },
  {
    distribution_package: 'Procter & Gamble Press Release Package',
    region: 'USA',
    price: 580.00,
    industry: 'Consumer Goods',
    news: 'The Procter & Gamble Company is an American multinational consumer goods corporation headquartered in Cincinnati, Ohio.',
    indexed: true,
    disclaimer: 'This press release package contains information about Procter & Gamble. Distribution and use of this content is subject to applicable laws and regulations.',
    no_of_indexed_websites: 25,
    no_of_non_indexed_websites: 60,
    image: null,
    link: 'https://www.pg.com',
    words_limit: 1050,
    language: 'English'
  },
  {
    distribution_package: 'Coca-Cola Company Press Release Package',
    region: 'USA',
    price: 520.00,
    industry: 'Food & Beverage',
    news: 'The Coca-Cola Company is an American multinational beverage corporation incorporated under Delaware\'s General Corporation Law and headquartered in Atlanta, Georgia.',
    indexed: true,
    disclaimer: 'This press release package contains information about The Coca-Cola Company. Distribution and use of this content is subject to applicable laws and regulations.',
    no_of_indexed_websites: 22,
    no_of_non_indexed_websites: 55,
    image: null,
    link: 'https://www.coca-cola.com',
    words_limit: 950,
    language: 'English'
  }
];

class PressPackPopulator {
  async populatePressPacks() {
    try {
      console.log('Starting press pack population with direct data...');

      let successCount = 0;
      let errorCount = 0;

      for (const pressPackData of PRESS_PACKS_DATA) {
        try {
          // Check if press pack already exists
          const existing = await this.findPressPackByName(pressPackData.distribution_package);
          if (existing) {
            console.log(`Press pack ${pressPackData.distribution_package} already exists, skipping...`);
            continue;
          }

          await PressPack.create(pressPackData);
          successCount++;
          console.log(`Saved press pack: ${pressPackData.distribution_package}`);
        } catch (error) {
          console.error(`Error processing press pack ${pressPackData.distribution_package}:`, error.message);
          errorCount++;
        }
      }

      console.log(`Press pack population complete. Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error) {
      console.error('Error in populatePressPacks:', error);
    }
  }

  async findPressPackByName(name) {
    try {
      const sql = 'SELECT * FROM press_packs WHERE distribution_package = $1';
      const result = await require('./src/config/database').query(sql, [name]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing press pack:', error);
      return null;
    }
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();
  const populator = new PressPackPopulator();
  populator.populatePressPacks()
    .then(() => {
      console.log('Press pack population script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Press pack population script failed:', error);
      process.exit(1);
    });
}

module.exports = PressPackPopulator;