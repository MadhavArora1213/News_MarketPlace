-- Insert sample agencies
INSERT INTO agencies (
  agency_name, agency_legal_entity_name, agency_website, agency_ig, agency_linkedin,
  agency_facebook, agency_address, agency_owner_name, agency_owner_linkedin,
  agency_founded_year, agency_owner_passport_nationality, agency_email,
  agency_contact_number, agency_owner_email, agency_owner_contact_number,
  agency_owner_whatsapp_number, status, how_did_you_hear_about_us, any_to_say,
  created_at, updated_at
) VALUES
(
  'TechMedia Solutions', 'TechMedia Solutions LLC', 'https://techmediasolutions.com',
  'https://instagram.com/techmediasolutions', 'https://linkedin.com/company/techmediasolutions',
  'https://facebook.com/techmediasolutions', '123 Tech Street, Silicon Valley, CA 94043',
  'John Smith', 'https://linkedin.com/in/johnsmith', 2015, 'American',
  'contact@techmediasolutions.com', '+1-555-0123', 'john@techmediasolutions.com',
  '+1-555-0124', '+1-555-0124', 'approved', 'Online search',
  'Leading digital marketing agency specializing in tech companies.',
  NOW(), NOW()
),
(
  'Global PR Partners', 'Global PR Partners Inc', 'https://globalprpartners.com',
  'https://instagram.com/globalprpartners', 'https://linkedin.com/company/globalprpartners',
  'https://facebook.com/globalprpartners', '456 Media Avenue, New York, NY 10001',
  'Sarah Johnson', 'https://linkedin.com/in/sarahjohnson', 2012, 'American',
  'info@globalprpartners.com', '+1-555-0567', 'sarah@globalprpartners.com',
  '+1-555-0568', '+1-555-0568', 'approved', 'Industry conference',
  'Comprehensive PR services for global brands.',
  NOW(), NOW()
),
(
  'Creative Advertising Hub', 'Creative Advertising Hub Ltd', 'https://creativeadvertisinghub.com',
  'https://instagram.com/creativeadvertisinghub', 'https://linkedin.com/company/creativeadvertisinghub',
  'https://facebook.com/creativeadvertisinghub', '789 Creative Blvd, Los Angeles, CA 90210',
  'Michael Davis', 'https://linkedin.com/in/michaeldavis', 2018, 'American',
  'hello@creativeadvertisinghub.com', '+1-555-0890', 'michael@creativeadvertisinghub.com',
  '+1-555-0891', '+1-555-0891', 'approved', 'Social media',
  'Award-winning advertising agency focused on creative campaigns.',
  NOW(), NOW()
);

-- Insert sample events
INSERT INTO events (
  title, description, event_type, status, country, city, venue, start_date, end_date,
  capacity, organizer, enable_guest, enable_media_partner, enable_sponsor, enable_speaker,
  created_at, updated_at
) VALUES
(
  'Tech Innovation Summit 2025', 'Annual technology innovation conference featuring industry leaders and cutting-edge presentations.',
  'Government Summit', 'active', 'United States', 'San Francisco', 'Moscone Center',
  '2025-03-15', '2025-03-17', 1000, 'Tech Events Inc',
  true, true, true, true, NOW(), NOW()
),
(
  'Digital Marketing World Forum', 'Global forum for digital marketing professionals to network and learn about latest trends.',
  'Power List', 'active', 'United Kingdom', 'London', 'Excel London',
  '2025-04-20', '2025-04-22', 800, 'DMWF Organizers',
  true, true, true, true, NOW(), NOW()
),
(
  'Startup Pitch Competition', 'Annual startup pitch competition where entrepreneurs present their innovative ideas to investors.',
  'Membership', 'active', 'Canada', 'Toronto', 'MaRS Discovery District',
  '2025-05-10', '2025-05-10', 200, 'Startup Canada',
  true, true, false, false, NOW(), NOW()
);

-- Insert sample AI generated articles
INSERT INTO ai_generated_articles (
  story_type, name, generated_content, status, user_id,
  created_at, updated_at
) VALUES
(
  'profile', 'Elon Musk',
  '<p>Elon Musk is a visionary entrepreneur and CEO of multiple groundbreaking companies. Born in South Africa and raised in Canada, Musk moved to the United States to pursue his dreams in technology and space exploration.</p><p>His companies include Tesla, SpaceX, Neuralink, and The Boring Company, each pushing the boundaries of innovation in their respective fields.</p>',
  'approved', NULL, NOW(), NOW()
),
(
  'editorial', 'Sustainable Energy Revolution',
  '<p>The world is undergoing a remarkable transformation towards sustainable energy sources. Renewable technologies like solar, wind, and hydroelectric power are becoming increasingly cost-effective and efficient.</p><p>Governments worldwide are implementing policies to accelerate this transition, with companies investing billions in clean energy infrastructure.</p>',
  'approved', NULL, NOW(), NOW()
),
(
  'listicle', 'The Future of Artificial Intelligence',
  '<p>Artificial Intelligence continues to evolve at an unprecedented pace. Here are the top 5 trends shaping the future of AI:</p><ol><li>Machine Learning Democratization</li><li>Edge Computing Integration</li><li>Ethical AI Development</li><li>Human-AI Collaboration</li><li>Autonomous Systems</li></ol>',
  'pending', NULL, NOW(), NOW()
);

-- Note: Article submissions require publication_id which is not null, so skipping for now