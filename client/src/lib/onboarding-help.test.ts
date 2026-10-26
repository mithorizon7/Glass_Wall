import { it } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { GuidedLearningOverlay, RestartGuideButton } from "../components/guided-learning-overlay";
import en from "../locales/en/glass-wall.json";
import lv from "../locales/lv/glass-wall.json";
import ru from "../locales/ru/glass-wall.json";

for (const [language, locale] of Object.entries({ en, lv, ru })) {
  it(`starts without a modal and exposes localized optional help in ${language}`, async () => {
    const instance = createInstance();
    await instance.use(initReactI18next).init({
      lng: language,
      resources: { [language]: { glassWall: locale } },
      defaultNS: "glassWall",
      interpolation: { escapeValue: false },
    });
    const render = (component: typeof RestartGuideButton | typeof GuidedLearningOverlay) =>
      renderToStaticMarkup(
        createElement(I18nextProvider, { i18n: instance }, createElement(component)),
      );
    assert.equal(render(GuidedLearningOverlay), "");
    assert.ok(render(RestartGuideButton).includes(locale.guidedLearning.openGuide));
    assert.ok(render(RestartGuideButton).includes('data-testid="button-restart-guide"'));
  });
}
