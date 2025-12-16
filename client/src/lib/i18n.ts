import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ICU from 'i18next-icu';

import enCommon from '../locales/en/common.json';
import enGlassWall from '../locales/en/glass-wall.json';
import lvCommon from '../locales/lv/common.json';
import lvGlassWall from '../locales/lv/glass-wall.json';
import ruCommon from '../locales/ru/common.json';
import ruGlassWall from '../locales/ru/glass-wall.json';

const resources = {
  en: {
    common: enCommon,
    glassWall: enGlassWall,
  },
  lv: {
    common: lvCommon,
    glassWall: lvGlassWall,
  },
  ru: {
    common: ruCommon,
    glassWall: ruGlassWall,
  },
};

i18n
  .use(ICU)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'glassWall'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
