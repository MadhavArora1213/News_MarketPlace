const axios = require('axios');

// List of translation APIs to try in order
const TRANSLATION_APIS = [
  // LibreTranslate APIs
  'https://translate.argosopentech.com/translate',
  'https://libretranslate.de/translate',
  'https://translate.astian.org/translate',
  'https://libretranslate.com/translate',
  'https://lt.qiling.org/translate',
  'https://translate.fortytwo-it.com/translate',
  // Apertium APIs (different endpoints)
  'https://apertium.org/apy/translate',
  'https://www.apertium.org/apy/translate',
  'https://api.apertium.org/translate'
];

async function testApiEndpoint(apiUrl) {
  try {
    console.log(`Testing ${apiUrl}...`);

    let response;
    let translatedText;

    if (apiUrl.includes('apertium.org')) {
      // Apertium APY uses GET with query parameters
      const params = new URLSearchParams({
        langpair: 'eng|spa', // English to Spanish
        q: 'Hello world'
      });

      response = await axios.get(`${apiUrl}?${params}`, {
        timeout: 5000 // 5 second timeout
      });

      // Check Apertium response format
      if (response.data && response.data.responseStatus === 200 && response.data.responseData?.translatedText) {
        translatedText = response.data.responseData.translatedText;
      }
    } else {
      // LibreTranslate format
      const requestData = {
        q: 'Hello world',
        source: 'en',
        target: 'es'
      };

      response = await axios.post(apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      });

      // LibreTranslate format
      translatedText = response.data?.translatedText;
    }

    if (translatedText) {
      console.log(`✅ ${apiUrl} is working!`);
      return translatedText;
    } else {
      console.log(`❌ ${apiUrl} returned invalid response format`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${apiUrl} failed:`, error.message);
    return false;
  }
}

async function testApis() {
  console.log('🔍 Testing LibreTranslate APIs...\n');

  for (const apiUrl of TRANSLATION_APIS) {
    const result = await testApiEndpoint(apiUrl);
    if (result) {
      console.log(`\n🎉 SUCCESS: The working API is: ${apiUrl}`);
      console.log(`Sample translation: "Hello world" → "${result}"`);
      console.log('This API will be used for all translations.');
      return apiUrl;
    }
  }

  console.log('\n❌ FAILURE: No working APIs found.');
  console.log('Please check your internet connection or try again later.');
  return null;
}

testApis().catch(console.error);