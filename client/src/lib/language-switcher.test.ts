import { it } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { LanguageSwitcher } from "../components/language-switcher";
import en from "../locales/en/common.json";
import lv from "../locales/lv/common.json";
import ru from "../locales/ru/common.json";

for (const [region, name] of [
  ["en-US", en.languageNative.en],
  ["lv-LV", lv.languageNative.lv],
  ["ru-RU", ru.languageNative.ru],
]) {
  it(`shows the resolved language label for ${region}`, async () => {
    const instance = createInstance();
    await instance.use(initReactI18next).init({
      lng: region,
      resources: { en: { common: en }, lv: { common: lv }, ru: { common: ru } },
      supportedLngs: ["en", "lv", "ru"],
      load: "languageOnly",
      fallbackLng: ["lv", "en"],
      defaultNS: "common",
      interpolation: { escapeValue: false },
    });
    const markup = renderToStaticMarkup(
      createElement(I18nextProvider, { i18n: instance }, createElement(LanguageSwitcher)),
    );
    assert.ok(markup.includes(`>${name}</button>`), region);
    instance.off("languageChanged loaded");
  });
}
