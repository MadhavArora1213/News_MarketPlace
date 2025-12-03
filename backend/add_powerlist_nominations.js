const powerlistController = require('./src/controllers/powerlistController');
const fs = require('fs');
const path = require('path');

async function addPowerlistNominations() {
  try {
    console.log('🚀 Starting to add powerlist nominations...');

    // Read the JSON file
    const jsonPath = path.join(__dirname, 'data', 'powerlist-nominations-2025-12-03T14-12-45-249477.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ JSON file not found: ${jsonPath}`);
      process.exit(1);
    }

    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(jsonData);

    console.log(`📊 Found ${data.nominations.length} nominations to process`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each nomination
    for (let i = 0; i < data.nominations.length; i++) {
      const nomination = data.nominations[i];

      try {
        console.log(`${i + 1}. Processing: ${nomination.publication_name}`);

        // Create mock request and response objects for the controller
        const req = {
          body: {
            publication_name: nomination.publication_name,
            website_url: nomination.website_url || '',
            power_list_name: nomination.power_list_name,
            industry: nomination.industry,
            company_or_individual: nomination.company_or_individual,
            tentative_month: nomination.tentative_month || '',
            location_region: nomination.location_region,
            last_power_list_url: nomination.last_power_list_url || nomination.website_url || '',
            image: nomination.image || '',
            status: nomination.status || 'approved'
          }
        };

        const res = {
          status: (code) => ({
            json: (data) => {
              if (code === 201) {
                console.log(`   ✅ Successfully added: ${nomination.publication_name}`);
                successCount++;
              } else {
                throw new Error(data.message || 'Controller returned error');
              }
            }
          })
        };

        // Use controller to create nomination
        await powerlistController.createNomination(req, res);

      } catch (error) {
        console.log(`   ❌ Error adding ${nomination.publication_name}: ${error.message}`);
        
        errors.push({
          publication: nomination.publication_name,
          error: error.message
        });
        errorCount++;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Summary
    console.log('\n📈 Summary:');
    console.log(`✅ Successfully added: ${successCount}`);
    console.log(`❌ Failed to add: ${errorCount}`);
    console.log(`📊 Total processed: ${data.nominations.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(error => {
        console.log(`   - ${error.publication}: ${error.error}`);
      });
    }

    console.log('\n🎉 Powerlist nominations import completed!');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the function
addPowerlistNominations();