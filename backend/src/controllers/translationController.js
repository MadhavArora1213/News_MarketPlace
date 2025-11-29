const { translateText } = require('../services/translationService');

const supportedLanguages = ['en', 'ar', 'hi', 'ru', 'zh', 'fr'];

function getSupportedLanguages(req, res) {
  res.json({ languages: supportedLanguages });
}

async function translate(req, res) {
  const { text, sourceLang, targetLang } = req.body;
  try {
    const result = await translateText(text, sourceLang, targetLang);
    if (result.error) {
      return res.status(500).json({ error: result.message });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getSupportedLanguages, translate };