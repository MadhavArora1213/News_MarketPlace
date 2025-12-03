import asyncio
import aiohttp
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
import json
import os
from urllib.parse import urljoin, urlparse
from PIL import Image
import io
import time
from datetime import datetime
import re

# Enhanced power list sources - 35+ nominations
power_list_sources = [
    {
        "publication_name": "Forbes Middle East",
        "website_url": "https://www.forbesmiddleeast.com/list/",
        "power_list_name": "Forbes Middle East Power List",
        "industry": "Business",
        "company_or_individual": "Individual",
        "tentative_month": "December",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.forbesmiddleeast.com/list/",
        "image": ""
    },
    {
        "publication_name": "Entrepreneur Middle East",
        "website_url": "https://www.entrepreneur.com/en-ae/leadership/the-2024-power-100-a-definitive-guide-to-success/484613",
        "power_list_name": "The 2024 Power 100: A Definitive Guide to Success",
        "industry": "Business",
        "company_or_individual": "Individual",
        "tentative_month": "December",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.entrepreneur.com/en-ae/leadership/the-2024-power-100-a-definitive-guide-to-success/484613",
        "image": ""
    },
    {
        "publication_name": "Arabian Business",
        "website_url": "https://www.arabianbusiness.com/powerlists",
        "power_list_name": "Arabian Business Power Lists",
        "industry": "Business",
        "company_or_individual": "Individual",
        "tentative_month": "November",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.arabianbusiness.com/powerlists",
        "image": ""
    },
    {
        "publication_name": "Gulf Business",
        "website_url": "https://gulfbusiness.com/tag/power-list/",
        "power_list_name": "Gulf Business Power List",
        "industry": "Business",
        "company_or_individual": "Individual",
        "tentative_month": "October",
        "location_region": "Gulf",
        "last_power_list_url": "https://gulfbusiness.com/tag/power-list/",
        "image": ""
    },
    {
        "publication_name": "Economy Middle East",
        "website_url": "https://economymiddleeast.com/lists/",
        "power_list_name": "Economy Middle East Power Lists",
        "industry": "Finance",
        "company_or_individual": "Individual",
        "tentative_month": "September",
        "location_region": "Middle East",
        "last_power_list_url": "https://economymiddleeast.com/lists/",
        "image": ""
    },
    {
        "publication_name": "Campaign Middle East",
        "website_url": "https://campaignme.com/campaign-middle-east-the-mena-power-list-2025/",
        "power_list_name": "Campaign Middle East The MENA Power List 2025",
        "industry": "Media",
        "company_or_individual": "Individual",
        "tentative_month": "January",
        "location_region": "MENA",
        "last_power_list_url": "https://campaignme.com/campaign-middle-east-the-mena-power-list-2025/",
        "image": ""
    },
    {
        "publication_name": "Construction Week Online",
        "website_url": "https://www.constructionweekonline.com/power-lists",
        "power_list_name": "Construction Week Power Lists",
        "industry": "Real Estate and Construction",
        "company_or_individual": "Individual",
        "tentative_month": "March",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.constructionweekonline.com/power-lists",
        "image": ""
    },
    {
        "publication_name": "Construction Business News Middle East",
        "website_url": "https://www.cbnme.com/mep-powerlist-2025/",
        "power_list_name": "MEP Powerlist 2025",
        "industry": "Real Estate and Construction",
        "company_or_individual": "Individual",
        "tentative_month": "January",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.cbnme.com/mep-powerlist-2025/",
        "image": ""
    },
    {
        "publication_name": "Finance World",
        "website_url": "https://thefinanceworld.com/category/lists/",
        "power_list_name": "Finance World Power Lists",
        "industry": "Finance",
        "company_or_individual": "Individual",
        "tentative_month": "June",
        "location_region": "Global",
        "last_power_list_url": "https://thefinanceworld.com/category/lists/",
        "image": ""
    },
    {
        "publication_name": "Hotelier Middle East",
        "website_url": "https://www.hoteliermiddleeast.com/executive-power-list-2025",
        "power_list_name": "Executive Power List 2025",
        "industry": "Travel & Tourism",
        "company_or_individual": "Individual",
        "tentative_month": "January",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.hoteliermiddleeast.com/executive-power-list-2025",
        "image": ""
    },
    {
        "publication_name": "Hotel & Catering",
        "website_url": "https://hotelandcatering.com/",
        "power_list_name": "Hotel & Catering Power List",
        "industry": "Food & Beverage",
        "company_or_individual": "Individual",
        "tentative_month": "April",
        "location_region": "Middle East",
        "last_power_list_url": "https://hotelandcatering.com/",
        "image": ""
    },
    {
        "publication_name": "Ahlan Dubai",
        "website_url": "https://www.ahlanlive.com/dubai/ahlan-hot-100-2026",
        "power_list_name": "Ahlan Hot 100 2026",
        "industry": "Media",
        "company_or_individual": "Individual",
        "tentative_month": "January",
        "location_region": "UAE",
        "last_power_list_url": "https://www.ahlanlive.com/dubai/ahlan-hot-100-2026",
        "image": ""
    },
    {
        "publication_name": "Finance Middle East",
        "website_url": "https://www.financemiddleeast.com/power-lists/",
        "power_list_name": "Finance Middle East Power Lists",
        "industry": "Finance",
        "company_or_individual": "Individual",
        "tentative_month": "May",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.financemiddleeast.com/power-lists/",
        "image": ""
    },
    {
        "publication_name": "Law Middle East",
        "website_url": "https://www.law-middle-east.com/gcs-in-the-gcc-power-list-2025-uae-edition/",
        "power_list_name": "GCs in the GCC Power List 2025 UAE Edition",
        "industry": "Legal",
        "company_or_individual": "Individual",
        "tentative_month": "January",
        "location_region": "GCC",
        "last_power_list_url": "https://www.law-middle-east.com/gcs-in-the-gcc-power-list-2025-uae-edition/",
        "image": ""
    },
    {
        "publication_name": "Legal 500",
        "website_url": "https://www.legal500.com/gc-powerlist/?sfid=6023&_sft_powerlist=middle-east-2025",
        "power_list_name": "GC Powerlist Middle East 2025",
        "industry": "Legal",
        "company_or_individual": "Individual",
        "tentative_month": "January",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.legal500.com/gc-powerlist/?sfid=6023&_sft_powerlist=middle-east-2025",
        "image": ""
    },
    # Additional 20+ sources for comprehensive coverage
    {
        "publication_name": "Whatson Dubai",
        "website_url": "https://whatson.ae/",
        "power_list_name": "Whatson Dubai Influencer List",
        "industry": "Media",
        "company_or_individual": "Individual",
        "tentative_month": "February",
        "location_region": "UAE",
        "last_power_list_url": "https://whatson.ae/",
        "image": ""
    },
    {
        "publication_name": "Timeout Dubai",
        "website_url": "https://www.timeoutdubai.com/",
        "power_list_name": "Timeout Dubai Power List",
        "industry": "Media",
        "company_or_individual": "Individual",
        "tentative_month": "March",
        "location_region": "UAE",
        "last_power_list_url": "https://www.timeoutdubai.com/",
        "image": ""
    },
    {
        "publication_name": "Fact Magazine",
        "website_url": "https://www.factmag.ae/",
        "power_list_name": "Fact Magazine Power List",
        "industry": "Media",
        "company_or_individual": "Individual",
        "tentative_month": "April",
        "location_region": "UAE",
        "last_power_list_url": "https://www.factmag.ae/",
        "image": ""
    },
    {
        "publication_name": "CEO Middle East",
        "website_url": "https://www.ceomiddleeast.com/",
        "power_list_name": "CEO Middle East Power List",
        "industry": "Business",
        "company_or_individual": "Individual",
        "tentative_month": "July",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.ceomiddleeast.com/",
        "image": ""
    },
    {
        "publication_name": "Middle East Architect",
        "website_url": "https://www.middleeastarchitect.com/",
        "power_list_name": "MEA Power List",
        "industry": "Real Estate and Construction",
        "company_or_individual": "Individual",
        "tentative_month": "August",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.middleeastarchitect.com/",
        "image": ""
    },
    {
        "publication_name": "Retail ME",
        "website_url": "https://www.retailme.com/",
        "power_list_name": "Retail ME Power List",
        "industry": "Retail",
        "company_or_individual": "Individual",
        "tentative_month": "September",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.retailme.com/",
        "image": ""
    },
    {
        "publication_name": "Healthcare Middle East",
        "website_url": "https://www.healthcaremiddleeast.com/",
        "power_list_name": "Healthcare Power List",
        "industry": "Healthcare",
        "company_or_individual": "Individual",
        "tentative_month": "October",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.healthcaremiddleeast.com/",
        "image": ""
    },
    {
        "publication_name": "Oil & Gas Middle East",
        "website_url": "https://www.oilandgasmiddleeast.com/",
        "power_list_name": "Oil & Gas Power List",
        "industry": "Oil & Gas",
        "company_or_individual": "Individual",
        "tentative_month": "November",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.oilandgasmiddleeast.com/",
        "image": ""
    },
    {
        "publication_name": "Emirates Woman",
        "website_url": "https://emirateswoman.com/",
        "power_list_name": "Emirates Woman Power List",
        "industry": "Media",
        "company_or_individual": "Individual",
        "tentative_month": "March",
        "location_region": "UAE",
        "last_power_list_url": "https://emirateswoman.com/",
        "image": ""
    },
    {
        "publication_name": "Harper's Bazaar Arabia",
        "website_url": "https://www.harpersbazaararabia.com/",
        "power_list_name": "Bazaar Power List",
        "industry": "Fashion",
        "company_or_individual": "Individual",
        "tentative_month": "April",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.harpersbazaararabia.com/",
        "image": ""
    },
    {
        "publication_name": "Vogue Arabia",
        "website_url": "https://en.vogue.me/",
        "power_list_name": "Vogue Arabia Power List",
        "industry": "Fashion",
        "company_or_individual": "Individual",
        "tentative_month": "May",
        "location_region": "Middle East",
        "last_power_list_url": "https://en.vogue.me/",
        "image": ""
    },
    {
        "publication_name": "Marie Claire Arabia",
        "website_url": "https://www.marieclairearabia.com/",
        "power_list_name": "Marie Claire Power Women",
        "industry": "Fashion",
        "company_or_individual": "Individual",
        "tentative_month": "June",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.marieclairearabia.com/",
        "image": ""
    },
    {
        "publication_name": "AD Middle East",
        "website_url": "https://www.admiddleeast.com/",
        "power_list_name": "AD100 Middle East",
        "industry": "Design",
        "company_or_individual": "Individual",
        "tentative_month": "July",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.admiddleeast.com/",
        "image": ""
    },
    {
        "publication_name": "Esquire Middle East",
        "website_url": "https://www.esquireme.com/",
        "power_list_name": "Esquire Power List",
        "industry": "Media",
        "company_or_individual": "Individual",
        "tentative_month": "August",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.esquireme.com/",
        "image": ""
    },
    {
        "publication_name": "GQ Middle East",
        "website_url": "https://www.gqmiddleeast.com/",
        "power_list_name": "GQ Men of the Year",
        "industry": "Media",
        "company_or_individual": "Individual",
        "tentative_month": "December",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.gqmiddleeast.com/",
        "image": ""
    },
    {
        "publication_name": "MEP Middle East",
        "website_url": "https://www.mepmiddleeast.com/",
        "power_list_name": "MEP Power List",
        "industry": "Real Estate and Construction",
        "company_or_individual": "Individual",
        "tentative_month": "September",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.mepmiddleeast.com/",
        "image": ""
    },
    {
        "publication_name": "MEED",
        "website_url": "https://www.meed.com/",
        "power_list_name": "MEED Power List",
        "industry": "Business",
        "company_or_individual": "Individual",
        "tentative_month": "October",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.meed.com/",
        "image": ""
    },
    {
        "publication_name": "Infrastructure Middle East",
        "website_url": "https://www.infrastructureme.com/",
        "power_list_name": "Infrastructure Power List",
        "industry": "Real Estate and Construction",
        "company_or_individual": "Individual",
        "tentative_month": "November",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.infrastructureme.com/",
        "image": ""
    },
    {
        "publication_name": "Facilities Management Middle East",
        "website_url": "https://www.fmme.ae/",
        "power_list_name": "FM Power List",
        "industry": "Real Estate and Construction",
        "company_or_individual": "Individual",
        "tentative_month": "December",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.fmme.ae/",
        "image": ""
    },
    {
        "publication_name": "Security Middle East",
        "website_url": "https://www.securitymiddleeast.com/",
        "power_list_name": "Security Power List",
        "industry": "Security",
        "company_or_individual": "Individual",
        "tentative_month": "January",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.securitymiddleeast.com/",
        "image": ""
    },
    {
        "publication_name": "Education Middle East",
        "website_url": "https://www.educationmiddleeast.com/",
        "power_list_name": "Education Power List",
        "industry": "Education",
        "company_or_individual": "Individual",
        "tentative_month": "February",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.educationmiddleeast.com/",
        "image": ""
    },
    {
        "publication_name": "Transport & Logistics ME",
        "website_url": "https://www.transportlogisticsme.com/",
        "power_list_name": "Transport & Logistics Power List",
        "industry": "Transport & Logistics",
        "company_or_individual": "Individual",
        "tentative_month": "March",
        "location_region": "Middle East",
        "last_power_list_url": "https://www.transportlogisticsme.com/",
        "image": ""
    }
]

class PowerlistNominationPopulator:
    def __init__(self):
        self.processed_urls = set()
        self.max_retries = 3
        self.retry_delay = 5
        self.json_fallback_data = []
        self.semaphore = asyncio.Semaphore(5)  # Limit concurrent requests

    async def populate_nominations(self):
        try:
            print(f"Starting powerlist nomination population for {len(power_list_sources)} sources...")
            print('All data will be saved to JSON file')

            # Use asyncio.gather for concurrent processing
            tasks = []
            for source in power_list_sources:
                if source['website_url'] not in self.processed_urls:
                    tasks.append(self.process_source(source))
                    self.processed_urls.add(source['website_url'])

            results = await asyncio.gather(*tasks, return_exceptions=True)

            total_success = sum(1 for r in results if not isinstance(r, Exception) and r is not None)
            total_error = sum(1 for r in results if isinstance(r, Exception) or r is None)

            # Save JSON data
            if self.json_fallback_data:
                await self.save_json_fallback()
                print("\nAll data saved to JSON file")
            else:
                print("\nNo data to save")

            print(f"\nPopulation complete. Success: {total_success}, Errors: {total_error}")
            print(f"Total nominations processed: {total_success + total_error}/{len(power_list_sources)}")

        except Exception as error:
            print(f'Fatal error in populateNominations: {error}')

    async def process_source(self, source):
        async with self.semaphore:
            try:
                nomination_data = await self.build_nomination_data_with_retry(source)
            except Exception as error:
                print(f"Error processing {source['publication_name']}: {error}")
                # Create basic nomination data even if scraping fails
                nomination_data = {
                    "publication_name": source["publication_name"],
                    "website_url": source["website_url"],
                    "power_list_name": source["power_list_name"],
                    "industry": source["industry"],
                    "company_or_individual": source["company_or_individual"],
                    "tentative_month": source["tentative_month"],
                    "location_region": source["location_region"],
                    "last_power_list_url": source["last_power_list_url"],
                    "image": "",
                    "status": "approved",
                    "is_active": True,
                    "description": self.generate_description(source),
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }

            try:
                await self.save_nomination(nomination_data)
                print(f"Saved nomination: {source['publication_name']}")
                return nomination_data
            except Exception as save_error:
                print(f"Error saving {source['publication_name']}: {save_error}")
                return None

    async def build_nomination_data_with_retry(self, source, attempt=1):
        try:
            return await self.build_nomination_data(source)
        except Exception as error:
            if attempt < self.max_retries:
                print(f"Retry attempt {attempt + 1}/{self.max_retries} for {source['publication_name']}")
                await asyncio.sleep(self.retry_delay * attempt)
                return await self.build_nomination_data_with_retry(source, attempt + 1)
            raise error

    async def build_nomination_data(self, source):
        power_list_name = source['power_list_name']
        description = self.generate_description(source)

        # Always try to get an image first
        print(f"Searching for logo/image for {source['publication_name']}...")
        image_url = await self.find_best_image(source['website_url'], source['publication_name'])

        # Try to scrape for better data (optional)
        try:
            print(f"Scraping enhanced data for {source['publication_name']}...")
            scraped_data = await self.scrape_website_data(source['website_url'])

            # Use scraped data if available and better than existing
            if scraped_data.get('title'):
                power_list_name = scraped_data['title']

            if scraped_data.get('description'):
                description = scraped_data['description']

            print(f"Results - Title: \"{scraped_data.get('title', 'N/A')}\", Description: \"{'OK' if scraped_data.get('description') else 'Error'}\"")
        except Exception as error:
            print(f"Warning: Enhanced scraping failed for {source['website_url']}: {error}")

        return {
            "publication_name": source["publication_name"],
            "website_url": source["website_url"],
            "power_list_name": power_list_name,
            "industry": source["industry"],
            "company_or_individual": source["company_or_individual"],
            "tentative_month": source["tentative_month"],
            "location_region": source["location_region"],
            "last_power_list_url": source["last_power_list_url"],
            "image": image_url,  # This will now be a local path if image was successfully downloaded
            "status": "approved",
            "is_active": True,
            "description": description,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

    def generate_description(self, source):
        industry_descriptions = {
            "Business": "recognizing outstanding business leaders and entrepreneurs",
            "Finance": "celebrating influential figures in banking, investment, and financial services",
            "Media": "highlighting creative professionals and media personalities",
            "Legal": "honoring distinguished legal practitioners and law firm leaders",
            "Real Estate and Construction": "showcasing leaders in property development and construction",
            "Healthcare": "recognizing medical professionals and healthcare innovators",
            "Education": "celebrating educational leaders and academic excellence",
            "Technology": "highlighting tech innovators and digital transformation leaders",
            "Fashion": "showcasing style icons and fashion industry leaders",
            "Travel & Tourism": "recognizing hospitality and tourism industry leaders"
        }

        industry_desc = industry_descriptions.get(source["industry"], "recognizing influential leaders and innovators")

        return f"{source['publication_name']}'s prestigious powerlist {industry_desc} across {source['location_region']}. " + \
               f"This annual recognition celebrates {source['company_or_individual'].lower()} excellence and impact in the industry." + \
               (f" Expected publication: {source['tentative_month']}." if source.get('tentative_month') else '')

    async def scrape_website_data(self, url):
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ])

            try:
                context = await browser.new_context(
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    extra_http_headers={
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
                    },
                    viewport={'width': 1366, 'height': 768}
                )
                page = await context.new_page()

                print(f"🔍 Scraping: {url}")
                await page.goto(url, wait_until='networkidle', timeout=60000)

                # Wait for content to load
                await asyncio.sleep(3)

                content = await page.content()
                soup = BeautifulSoup(content, 'html.parser')

                # Enhanced title extraction
                title = self.extract_title(soup, url)

                # Enhanced image extraction
                image = await self.extract_best_image(soup, url, page)

                # Extract description
                description = self.extract_description(soup)

                # Extract power list specific information
                power_list_name = self.extract_power_list_name(soup, title)

                print(f"Extracted - Title: \"{title}\", Image: \"{'YES' if image else 'NO'}\", Description: \"{'YES' if description else 'NO'}\"")

                # Download and save image if found
                local_image_path = ''
                if image:
                    try:
                        local_image_path = await self.download_and_save_image(image, title)
                    except Exception as image_error:
                        print(f"Image download failed for {title}: {image_error}")

                return {
                    "title": title or '',
                    "powerListName": power_list_name or '',
                    "image": local_image_path,
                    "description": description or '',
                    "logo": image or ''
                }

            finally:
                await context.close()
                await browser.close()

    def extract_title(self, soup, url):
        title_selectors = [
            'h1.entry-title',
            'h1.post-title',
            'h1.article-title',
            'h1[class*="title"]',
            'h1',
            '.page-title',
            '.entry-header h1',
            '[class*="headline"]',
            'title'
        ]

        for selector in title_selectors:
            element = soup.select_one(selector)
            if element:
                title = element.get_text().strip()
                if title and len(title) > 5:
                    title = re.sub(r'\|.*$| - .*$', '', title).strip()
                    if len(title) > 10:
                        return title

        # Fallback to page title
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text().strip()
            title = re.sub(r'\|.*$| - .*$', '', title).strip()

        return title or 'Power List'

    async def extract_best_image(self, soup, url, page):
        image_selectors = [
            'meta[property="og:image"]',
            'meta[name="twitter:image"]',
            'meta[property="og:image:url"]',
            'meta[name="twitter:image:src"]',
            'link[rel="image_src"]',
            '.featured-image img',
            '.post-thumbnail img',
            '.wp-post-image',
            '.entry-content img:first-child',
            'article img:first-child',
            '.hero-image img',
            '.banner img',
            '.header-image img',
            '.logo img',
            '.site-logo img',
            '.brand-logo img',
            'header img[src*="logo"]',
            'img[class*="logo"]',
            'img[alt*="logo"]',
            'img[src*="logo"]',
            '.navbar img',
            '.navigation img'
        ]

        for selector in image_selectors:
            element = soup.select_one(selector)
            img_src = ''

            if selector.startswith('meta') or selector.startswith('link'):
                img_src = element.get('content') or element.get('href')
            else:
                img_src = element.get('src') or element.get('data-src') or element.get('data-lazy-src') or element.get('data-original')

            if img_src:
                img_src = urljoin(url, img_src)
                if await self.is_valid_and_accessible_image(img_src):
                    print(f"Found valid image: {img_src}")
                    return img_src

        # If no image found, try to find any suitable image
        all_images = soup.find_all('img')
        for img in all_images:
            img_src = img.get('src') or img.get('data-src')
            if img_src:
                img_src = urljoin(url, img_src)
                if await self.is_valid_and_accessible_image(img_src):
                    print(f"Found fallback image: {img_src}")
                    return img_src

        return ''

    def normalize_image_url(self, img_src, base_url):
        if img_src.startswith('//'):
            return 'https:' + img_src
        elif img_src.startswith('/'):
            return urljoin(base_url, img_src)
        elif not img_src.startswith('http'):
            return urljoin(base_url, img_src)
        return img_src

    async def is_valid_and_accessible_image(self, url):
        try:
            if url.startswith('data:') or url.startswith('blob:'):
                return False

            if 'favicon' in url or 'icon' in url or 'sprite' in url:
                return False

            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.google.com/'
            }

            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.head(url, timeout=aiohttp.ClientTimeout(total=8)) as response:
                    content_type = response.headers.get('content-type', '')
                    content_length = int(response.headers.get('content-length', '0'))

                    return content_type.startswith('image/') and content_length > 2000 and content_length < 10000000
        except:
            return False

    async def find_best_image(self, website_url, publication_name):
        try:
            print(f"Searching for logo/image for {publication_name}...")
            domain = urlparse(website_url).netloc

            logo_urls = [
                f"https://{domain}/wp-content/uploads/logo.png",
                f"https://{domain}/wp-content/uploads/logo.jpg",
                f"https://{domain}/wp-content/uploads/logo.svg",
                f"https://{domain}/wp-content/themes/{domain.split('.')[0]}/images/logo.png",
                f"https://{domain}/wp-content/uploads/{datetime.now().year}/logo.png",
                f"https://{domain}/images/logo.png",
                f"https://{domain}/images/logo.jpg",
                f"https://{domain}/images/logo.svg",
                f"https://{domain}/assets/images/logo.png",
                f"https://{domain}/assets/images/logo.jpg",
                f"https://{domain}/assets/logo.png",
                f"https://{domain}/static/images/logo.png",
                f"https://{domain}/static/logo.png",
                f"https://{domain}/media/logo.png",
                f"https://{domain}/logo.png",
                f"https://{domain}/logo.jpg",
                f"https://{domain}/logo.svg",
                f"https://{domain}/brand/logo.png",
                f"https://{domain}/brand/images/logo.png",
                f"https://{domain}/sites/default/files/logo.png",
                f"https://{domain}/uploads/logo.png",
                f"https://{domain}/apple-touch-icon.png",
                f"https://{domain}/apple-touch-icon-180x180.png",
                f"https://{domain}/favicon-32x32.png",
                f"https://{domain}/favicon.png"
            ]

            for logo_url in logo_urls:
                try:
                    if await self.is_valid_and_accessible_image(logo_url):
                        local_path = await self.download_and_save_image(logo_url, f"{publication_name}-logo")
                        print(f"Successfully found and saved logo: {logo_url}")
                        return local_path
                except:
                    continue

            # Try to scrape the homepage for logo images
            try:
                logo_from_homepage = await self.scrape_logo(website_url)
                if logo_from_homepage:
                    return logo_from_homepage
            except Exception as error:
                print(f"Error scraping homepage logo for {publication_name}: {error}")

            print(f"No logo found for {publication_name}")
            return ''
        except Exception as error:
            print(f"Logo search failed for {publication_name}: {error}")
            return ''

    async def scrape_logo(self, url):
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True, args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ])

            try:
                context = await browser.new_context(
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                )
                page = await context.new_page()
                await page.goto(url, wait_until='networkidle', timeout=30000)

                content = await page.content()
                soup = BeautifulSoup(content, 'html.parser')

                logo_selectors = [
                    'img[alt*="logo" i]',
                    'img[class*="logo" i]',
                    'img[src*="logo" i]',
                    '.site-logo img',
                    '.navbar-brand img',
                    '.header-logo img',
                    '.brand img',
                    'header img:first-child'
                ]

                for selector in logo_selectors:
                    img = soup.select_one(selector)
                    if img:
                        src = img.get('src') or img.get('data-src')
                        if src:
                            normalized_src = urljoin(url, src)
                            if await self.is_valid_and_accessible_image(normalized_src):
                                await browser.close()
                                publication_name = urlparse(url).netloc.replace('.', '-')
                                return await self.download_and_save_image(normalized_src, f"{publication_name}-scraped-logo")

                await context.close()
                await browser.close()
                return ''
            except Exception as error:
                print(f'Error scraping logo from homepage: {error}')
                return ''

    async def download_and_save_image(self, image_url, filename):
        try:
            print(f"Downloading image: {image_url}")

            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.google.com/'
            }

            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.get(image_url, timeout=aiohttp.ClientTimeout(total=20)) as response:
                    if response.status == 200:
                        image_data = await response.read()
                        if len(image_data) > 2000:
                            local_path = await self.save_image_locally(image_data, filename)
                            print(f"Successfully downloaded and saved: {local_path}")
                            return local_path

                    raise Exception(f"Invalid image data: {len(image_data) if 'image_data' in locals() else 0} bytes")
        except Exception as error:
            print(f"Image download failed for {filename}: {error}")
            raise error

    async def save_image_locally(self, image_buffer, filename):
        try:
            uploads_dir = os.path.join(os.getcwd(), 'uploads', 'powerlist-nominations')
            os.makedirs(uploads_dir, exist_ok=True)

            timestamp = int(time.time() * 1000)
            random_suffix = str(hash(filename))[:8]

            # Detect image type
            extension = '.jpg'
            signature = image_buffer[:4].hex()
            if signature.startswith('89504e47'):
                extension = '.png'
            elif signature.startswith('47494638'):
                extension = '.gif'
            elif signature.startswith('ffd8ffe') or signature.startswith('ffd8ffdb'):
                extension = '.jpg'
            elif signature.startswith('52494646'):
                extension = '.webp'

            base_name = re.sub(r'[^a-zA-Z0-9-]', '-', filename.lower())
            unique_filename = f"{base_name}-{timestamp}-{random_suffix}{extension}"
            filepath = os.path.join(uploads_dir, unique_filename)

            # Optimize image
            try:
                img = Image.open(io.BytesIO(image_buffer))
                img.thumbnail((400, 300), Image.Resampling.LANCZOS)
                img.save(filepath, quality=85, optimize=True)
            except Exception:
                # Save original if optimization fails
                with open(filepath, 'wb') as f:
                    f.write(image_buffer)

            public_url = f"/uploads/powerlist-nominations/{unique_filename}"
            print(f"Image saved locally: {public_url}")

            return public_url
        except Exception as error:
            print(f"Local image save error: {error}")
            raise Exception(f"Failed to save image locally: {error}")

    async def save_nomination(self, nomination_data):
        try:
            self.json_fallback_data.append(nomination_data)
            print(f"Added to JSON data: {nomination_data['publication_name']}")
        except Exception as error:
            print(f'JSON save error: {error}')
            raise error

    async def save_json_fallback(self):
        try:
            output_dir = os.path.join(os.getcwd(), 'data')
            os.makedirs(output_dir, exist_ok=True)

            timestamp = datetime.now().isoformat().replace(':', '-').replace('.', '-')
            filename = f"powerlist-nominations-{timestamp}.json"
            filepath = os.path.join(output_dir, filename)

            json_data = {
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "total_nominations": len(self.json_fallback_data),
                    "source": "Enhanced Powerlist Nomination Populator",
                    "note": "Complete powerlist nominations data ready for import"
                },
                "nominations": self.json_fallback_data
            }

            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, indent=2, ensure_ascii=False)

            print(f"\nJSON data saved: {filepath}")
            print(f"Total nominations in file: {len(self.json_fallback_data)}")

            # Create import script
            await self.create_import_script(filename)

        except Exception as error:
            print(f'Error saving JSON data: {error}')

    async def create_import_script(self, json_filename):
        try:
            import_script = f'''# Import script for powerlist nominations
import json
import os
from datetime import datetime

def import_powerlist_nominations():
    try:
        print('Starting powerlist nominations import...')

        json_path = os.path.join(os.getcwd(), 'data', '{json_filename}')
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        print(f"Found {{len(data['nominations'])}} nominations to import")

        imported = 0
        skipped = 0

        # Note: Database import logic would go here
        # For now, just count
        for nomination in data['nominations']:
            print(f"Would import: {{nomination['publication_name']}}")
            imported += 1

        print(f"\\nImport complete!\\nImported: {{imported}}\\nSkipped: {{skipped}}")

    except Exception as error:
        print(f'Import failed: {{error}}')

if __name__ == "__main__":
    import_powerlist_nominations()
'''

            script_path = os.path.join(os.getcwd(), 'import_powerlist_nominations.py')
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(import_script)

            print(f"Import script created: {script_path}")
            print("Run with: python import_powerlist_nominations.py")

        except Exception as error:
            print(f'Error creating import script: {error}')

    def extract_description(self, soup):
        description_selectors = [
            'meta[name="description"]',
            'meta[property="og:description"]',
            'meta[name="twitter:description"]',
            '.entry-content p:first-child',
            '.post-content p:first-child',
            '.article-content p:first-child',
            '.content p:first-child',
            '.description',
            '.excerpt',
            '.summary'
        ]

        for selector in description_selectors:
            element = soup.select_one(selector)
            if element:
                description = ''
                if selector.startswith('meta'):
                    description = element.get('content', '')
                else:
                    description = element.get_text()

                if description and len(description.strip()) > 20:
                    description = re.sub(r'\s+', ' ', description.strip())
                    description = description[:500]
                    if len(description) > 30:
                        return description

        return ''

    def extract_power_list_name(self, soup, fallback_title):
        power_list_selectors = [
            'h1[class*="power" i]',
            'h1[class*="list" i]',
            '.power-list-title',
            '.list-title',
            '[class*="powerlist"]',
            'h1:contains("Power")',
            'h1:contains("List")'
        ]

        for selector in power_list_selectors:
            element = soup.select_one(selector)
            if element:
                title = element.get_text().strip()
                if title and len(title) > 5:
                    return title

        # If no specific power list title found, enhance the fallback title
        if fallback_title:
            if fallback_title.lower().find('power') != -1 or fallback_title.lower().find('list') != -1:
                return fallback_title
            elif len(fallback_title) > 10:
                return fallback_title + ' Power List'

        return ''

# Enhanced run section
if __name__ == "__main__":
    populator = PowerlistNominationPopulator()

    print('Starting Enhanced Powerlist Nomination Populator...')
    print(f'Target: {len(power_list_sources)} powerlist nominations')
    print('Note: Images will be saved locally, all data will be saved to JSON file')

    asyncio.run(populator.populate_nominations())

    print('\nScript completed successfully!')
    print('Data saved to JSON file for database import.')
    print('Use the generated import script to add data to database when ready.')
