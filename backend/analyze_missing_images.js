const fs = require('fs');
const path = require('path');

// Read the powerlist nominations JSON file
const jsonFilePath = path.join(__dirname, 'data', 'powerlist-nominations-2025-12-03T14-12-45-249477.json');

try {
  const rawData = fs.readFileSync(jsonFilePath, 'utf8');
  const data = JSON.parse(rawData);
  
  console.log(`Total nominations: ${data.nominations.length}`);
  
  // Find nominations with missing images
  const missingImages = data.nominations.filter(nomination => 
    !nomination.image || nomination.image.trim() === ''
  );
  
  console.log(`\nNominations with missing images: ${missingImages.length}`);
  console.log('\nList of publications needing images:');
  
  missingImages.forEach((nomination, index) => {
    console.log(`${index + 1}. ${nomination.publication_name}`);
    console.log(`   Website: ${nomination.website_url}`);
    console.log(`   Industry: ${nomination.industry}`);
    console.log('');
  });
  
  // Save the missing images list for later use
  const missingImagesData = {
    metadata: {
      generated_at: new Date().toISOString(),
      total_missing: missingImages.length,
      source: "Powerlist Nominations Missing Images Analysis"
    },
    missing_images: missingImages.map(nomination => ({
      publication_name: nomination.publication_name,
      website_url: nomination.website_url,
      industry: nomination.industry,
      power_list_name: nomination.power_list_name,
      location_region: nomination.location_region
    }))
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'data', 'missing_images_analysis.json'),
    JSON.stringify(missingImagesData, null, 2)
  );
  
  console.log('Analysis saved to data/missing_images_analysis.json');
  
} catch (error) {
  console.error('Error analyzing JSON file:', error);
}