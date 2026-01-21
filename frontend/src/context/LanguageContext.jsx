import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';
import frTranslations from '../locales/fr.json';
import hiTranslations from '../locales/hi.json';
import zhTranslations from '../locales/zh.json';
import ruTranslations from '../locales/ru.json';
import { forceResetTranslationCache } from '../hooks/useTranslation';

const LanguageContext = createContext();

const translations = {
  en: enTranslations,
  ar: arTranslations,
  fr: frTranslations,
  hi: hiTranslations,
  'zh-CN': zhTranslations,
  ru: ruTranslations,
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const switchLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      console.log(`🌍 Switching language: ${language} → ${newLanguage}`);

      // FORCE clear ALL translation caches before switching
      // This ensures translator.py API is called for fresh translations
      forceResetTranslationCache();

      setLanguage(newLanguage);
      localStorage.setItem('language', newLanguage);
    }
  };

  const t = (key, params = {}) => {
    let value;
    // First check if the full key exists (handles keys with dots/periods)
    if (translations[language]?.[key]) {
      value = translations[language][key];
    } else {
      // If not, try nested path lookup (legacy behavior)
      const keys = key.split('.');
      value = translations[language];
      for (const k of keys) {
        value = value?.[k];
      }
    }

    let defaultValue = key;
    let substitutionParams = {};

    // Check if params is a string (use as default value) or object (use for substitution)
    if (typeof params === 'string') {
      defaultValue = params;
    } else if (params && typeof params === 'object' && !Array.isArray(params)) {
      substitutionParams = params;
    }

    let text = value || defaultValue;

    // Perform parameter substitution if substitutionParams are provided
    if (typeof text === 'string' && Object.keys(substitutionParams).length > 0) {
      Object.keys(substitutionParams).forEach(param => {
        // Escape the parameter key to avoid "Invalid regular expression" errors with braces
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), substitutionParams[param]);
      });
    }

    return text;
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};