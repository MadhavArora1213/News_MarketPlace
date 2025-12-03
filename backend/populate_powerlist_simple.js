const fs = require('fs');
const path = require('path');
const { query } = require('./src/config/database');

class SimplePowerlistPopulator {
  async populatePowerlistNominations() {
    try {
      console.log('Starting simple powerlist nominations population...');
      
      // Read the powerlist nominations JSON file
      const jsonFilePath = path.join(__dirname, 'data', 'powerlist-nominations-2025-12-03T14-12-45-249477.json');
      const rawData = fs.readFileSync(jsonFilePath, 'utf8');
      const data = JSON.parse(rawData);
      
      let successCount = 0;
      let errorCount = 0;

      for (const nomination of data.nominations) {
        try {
          // Prepare nomination data for direct SQL insertion
          const nominationData = {
            publication_name: nomination.publication_name,
            website_url: nomination.website_url,
            power_list_name: nomination.power_list_name,
            industry: nomination.industry,
            company_or_individual: nomination.company_or_individual,
            tentative_month: nomination.tentative_month,
            location_region: nomination.location_region,
            last_power_list_url: nomination.last_power_list_url,
            image: nomination.image || null,
            status: nomination.status || 'approved',
            is_active: nomination.is_active !== undefined ? nomination.is_active : true
          };

          // Insert directly into database using raw SQL
          const sql = `
            INSERT INTO powerlist_nominations (
              publication_name, website_url, power_list_name, industry, company_or_individual,
              tentative_month, location_region, last_power_list_url, image, status, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
          `;

          const values = [
            nominationData.publication_name,
            nominationData.website_url,
            nominationData.power_list_name,
            nominationData.industry,
            nominationData.company_or_individual,
            nominationData.tentative_month,
            nominationData.location_region,
            nominationData.last_power_list_url,
            nominationData.image,
            nominationData.status,
            nominationData.is_active
          ];

          const result = await query(sql, values);
          successCount++;
          console.log(`✅ Created nomination: ${result.rows[0].publication_name} (ID: ${result.rows[0].id})`);

        } catch (error) {
          console.error(`❌ Error processing nomination ${nomination.publication_name}:`, error.message);
          errorCount++;
        }
      }

      console.log(`\n🎉 Population completed!`);
      console.log(`📊 Total processed: ${data.nominations.length}`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Errors: ${errorCount}`);

      // Verify the final count
      const finalCount = await query('SELECT COUNT(*) as count FROM powerlist_nominations', []);
      console.log(`📈 Final database count: ${finalCount.rows[0].count}`);

    } catch (error) {
      console.error('❌ Error in populatePowerlistNominations:', error);
    }
  }
}

// Run the populator
if (require.main === module) {
  require('dotenv').config();
  const populator = new SimplePowerlistPopulator();
  populator.populatePowerlistNominations()
    .then(() => {
      console.log('Simple powerlist nominations population completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Simple powerlist nominations population failed:', error);
      process.exit(1);
    });
}

module.exports = SimplePowerlistPopulator;