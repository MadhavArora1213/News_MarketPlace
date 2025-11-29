import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: {} },
    ar: { translation: {} },
    hi: { translation: {} },
    ru: { translation: {} },
    zh: { translation: {} },
    fr: { translation: {} }
  },
  interpolation: { escapeValue: false },
  react: {
    useSuspense: false
  }
});


export default i18n;