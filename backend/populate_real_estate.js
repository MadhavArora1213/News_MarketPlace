const RealEstate = require('./src/models/RealEstate');

class RealEstatePopulator {
  constructor() {
    this.processedProperties = new Set();
  }

  async populateRealEstate() {
    try {
      console.log('Starting real estate population...');

      const properties = this.generateSampleProperties();
      let totalSuccess = 0;
      let totalError = 0;

      for (const property of properties) {
        try {
          const propertyData = this.buildPropertyData(property);
          await this.saveProperty(propertyData);

          totalSuccess++;
          console.log(`Saved property: ${property.title}`);

          // Small delay
          await this.delay(500);
        } catch (error) {
          console.error(`Error processing property ${property.title}:`, error.message);
          totalError++;
        }
      }

      console.log(`\nPopulation complete. Success: ${totalSuccess}, Errors: ${totalError}`);

    } catch (error) {
      console.error('Error in populateRealEstate:', error);
    }
  }

  generateSampleProperties() {
    const properties = [
      {
        title: 'Luxury Downtown Penthouse',
        location: 'New York, NY',
        type: 'Apartment',
        bedrooms: 3,
        bathrooms: 2,
        area: 2500,
        price: 2500000
      },
      {
        title: 'Modern Suburban Family Home',
        location: 'Los Angeles, CA',
        type: 'House',
        bedrooms: 4,
        bathrooms: 3,
        area: 3200,
        price: 1800000
      },
      {
        title: 'Waterfront Condo with Ocean View',
        location: 'Miami, FL',
        type: 'Condo',
        bedrooms: 2,
        bathrooms: 2,
        area: 1800,
        price: 950000
      },
      {
        title: 'Historic Brownstone in Brooklyn',
        location: 'Brooklyn, NY',
        type: 'Townhouse',
        bedrooms: 3,
        bathrooms: 2,
        area: 2200,
        price: 1650000
      },
      {
        title: 'Mountain View Cabin',
        location: 'Aspen, CO',
        type: 'Cabin',
        bedrooms: 2,
        bathrooms: 1,
        area: 1200,
        price: 750000
      }
    ];

    return properties;
  }

  buildPropertyData(property) {
    return {
      title: property.title,
      description: `Beautiful ${property.type.toLowerCase()} located in ${property.location}. Features ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms with ${property.area} square feet of living space.`,
      price: property.price,
      location: property.location,
      property_type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area_sqft: property.area,
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg'
      ],
      status: 'approved',
      submitted_by: 1
    };
  }

  async saveProperty(propertyData) {
    // Check if property already exists
    const existing = await this.findPropertyByTitle(propertyData.title);
    if (existing) {
      console.log(`Property ${propertyData.title} already exists, skipping...`);
      return;
    }

    await RealEstate.create(propertyData);
  }

  async findPropertyByTitle(title) {
    try {
      const sql = 'SELECT * FROM real_estates WHERE title = $1';
      const result = await require('./src/config/database').query(sql, [title]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking existing property:', error);
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
  const populator = new RealEstatePopulator();
  populator.populateRealEstate()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = RealEstatePopulator;