import { describe, it, expect } from "vitest";
import { translate, translations } from "../translations";

describe("translate", () => {
  it("returns the value for the requested language", () => {
    expect(translate("send", "en")).toBe("Send");
    expect(translate("appName", "hi")).toBe(translations.hi.appName);
  });

  it("falls back to English when a Hindi entry is empty", () => {
    const key = "send" as const;
    const original = translations.hi[key];
    translations.hi[key] = "";
    expect(translate(key, "hi")).toBe(translations.en[key]);
    translations.hi[key] = original;
  });
});

describe("translations", () => {
  it("has an identical key set in en and hi, so a new key can't be forgotten in one language", () => {
    const enKeys = Object.keys(translations.en).sort();
    const hiKeys = Object.keys(translations.hi).sort();
    expect(hiKeys).toEqual(enKeys);
  });

  it("has no empty string values in either language", () => {
    for (const [key, value] of Object.entries(translations.en)) {
      expect(value, `en.${key} should not be empty`).not.toBe("");
    }
    for (const [key, value] of Object.entries(translations.hi)) {
      expect(value, `hi.${key} should not be empty`).not.toBe("");
    }
  });
});
