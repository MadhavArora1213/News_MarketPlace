import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Global cache for ongoing translation requests to avoid duplicates
const translationPromises = new Map();

function useTranslatedText(text, sourceLang = 'en') {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    if (!text || sourceLang === currentLang) {
      setTranslatedText(text);
      return;
    }

    const key = `translation:${currentLang}:${text}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      setTranslatedText(cached);
      return;
    }

    const cacheKey = `${currentLang}:${text}`;
    if (translationPromises.has(cacheKey)) {
      // Wait for the ongoing request
      translationPromises.get(cacheKey).then(result => {
        setTranslatedText(result);
      });
      return;
    }

    const fetchTranslation = async () => {
      try {
        const response = await fetch('/api/translations/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, sourceLang, targetLang: currentLang }),
        });
        const data = await response.json();
        if (data.translatedText) {
          localStorage.setItem(key, data.translatedText);
          return data.translatedText;
        } else {
          return text;
        }
      } catch (error) {
        return text;
      }
    };

    const promise = fetchTranslation();
    translationPromises.set(cacheKey, promise);

    promise.then(result => {
      translationPromises.delete(cacheKey);
      setTranslatedText(result);
    }).catch(() => {
      translationPromises.delete(cacheKey);
      setTranslatedText(text);
    });
  }, [text, sourceLang, currentLang]);

  return translatedText;
}

export default useTranslatedText;