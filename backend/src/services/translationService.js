const axios = require('axios');
const redis = require('redis');
const client = redis.createClient();
client.connect();

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
        const response = await axios.post('https://libretranslate.de/translate', {
            q: text,
            source: sourceLang,
            target: targetLang
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200 && response.data && response.data.translatedText) {
            try {
                await client.setEx(key, 3600, response.data.translatedText);
            } catch (redisError) {
                // Ignore
            }
            return { translatedText: response.data.translatedText };
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

module.exports = { translateText };