const axios = require('axios');
const redis = require('redis');
const client = redis.createClient();
client.connect();

// List of translation APIs to try in order
const TRANSLATION_APIS = [
  // LibreTranslate APIs
  'https://translate.argosopentech.com/translate',
  'https://libretranslate.de/translate',
  'https://translate.astian.org/translate',
  'https://libretranslate.com/translate',
  'https://lt.qiling.org/translate',
  'https://translate.fortytwo-it.com/translate',
  // Apertium API
  'https://apertium.org/apy/translate'
];

async function testApiEndpoint(apiUrl) {
  try {
    const response = await axios.post(apiUrl, {
      q: 'Hello world',
      source: 'en',
      target: 'es'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });

    if (response.status === 200 && response.data && response.data.translatedText) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(`API ${apiUrl} failed:`, error.message);
    return false;
  }
}

async function findWorkingApi() {
  console.log('Testing LibreTranslate APIs...');

  for (const apiUrl of TRANSLATION_APIS) {
    console.log(`Testing ${apiUrl}...`);
    const isWorking = await testApiEndpoint(apiUrl);
    if (isWorking) {
      console.log(`✅ Working API found: ${apiUrl}`);
      return apiUrl;
    } else {
      console.log(`❌ API ${apiUrl} not working`);
    }
  }

  console.log('❌ No working API found');
  return null;
}

// Cache the working API URL
let workingApiUrl = null;

async function getWorkingApi() {
  if (workingApiUrl) {
    return workingApiUrl;
  }

  workingApiUrl = await findWorkingApi();
  return workingApiUrl;
}

async function translateText(text, sourceLang, targetLang) {
    try {
        const key = `translate:${sourceLang}:${targetLang}:${Buffer.from(text).toString('base64')}`;
        try {
            const cached = await client.get(key);
            if (cached) {
                return { translatedText: cached };
            }
        } catch (redisError) {
            // Ignore Redis error, proceed to API
        }

        // Get working API
        const apiUrl = await getWorkingApi();
        if (!apiUrl) {
            return { error: true, message: 'No translation service available' };
        }

        console.log(`Using translation API: ${apiUrl}`);

        let requestData;
        let translatedText;

        let response;

        // Different API formats
        if (apiUrl.includes('apertium.org')) {
            // Apertium APY uses GET with query parameters
            const params = new URLSearchParams({
                langpair: `${sourceLang}|${targetLang}`,
                q: text
            });

            response = await axios.get(`${apiUrl}?${params}`, {
                timeout: 10000 // 10 second timeout
            });
        } else {
            // LibreTranslate format
            const requestData = {
                q: text,
                source: sourceLang,
                target: targetLang
            };

            response = await axios.post(apiUrl, requestData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
        }

        if (response.status === 200 && response.data) {
            if (apiUrl.includes('apertium.org')) {
                // Apertium APY format: {"responseStatus": 200, "responseData": {"translatedText": "..."}}
                if (response.data.responseStatus === 200 && response.data.responseData?.translatedText) {
                    translatedText = response.data.responseData.translatedText;
                } else {
                    return { error: true, message: 'Invalid response from Apertium API' };
                }
            } else {
                // LibreTranslate format
                translatedText = response.data.translatedText;
            }

            if (translatedText) {
                try {
                    await client.setEx(key, 3600, translatedText);
                } catch (redisError) {
                    // Ignore
                }
                return { translatedText };
            } else {
                return { error: true, message: 'Invalid response from translation API' };
            }
        } else {
            return { error: true, message: 'Invalid response from translation API' };
        }
    } catch (error) {
        if (error.response) {
            if (error.response.status === 429) {
                return { error: true, message: 'Rate limit exceeded' };
            } else {
                return { error: true, message: `API error: ${error.response.status} ${error.response.statusText}` };
            }
        } else if (error.request) {
            return { error: true, message: 'Network error: Unable to reach translation API' };
        } else {
            return { error: true, message: `Unexpected error: ${error.message}` };
        }
    }
}

module.exports = { translateText, findWorkingApi };